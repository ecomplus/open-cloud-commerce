import type { Request, Response } from 'firebase-functions/v1';
import type { AppModuleName, AppModuleBody } from '@cloudcommerce/types';
import type { ApiError, ApiConfig } from '@cloudcommerce/api';
import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import api from '@cloudcommerce/api';
import config, { logger } from '@cloudcommerce/firebase/lib/config';
import {
  ajv,
  ajvOptions,
  parseAjvErrors,
  sendRequestError,
} from './ajv';
import callAppModule from './call-app-module';

declare global {
  // eslint-disable-next-line
  var $activeModuleApps: undefined | Array<AppModuleBody['application']>;
}

const ajvAppsResponse = addFormats(new Ajv({ ...ajvOptions, allErrors: true }));

// Cache apps list and no params modules results
const appsCache = {};
const resultsCache = {};

async function runModule(
  params: { [key: string]: any },
  res: Response,
  modName: string,
  validate: ValidateFunction,
  responseValidate: ValidateFunction,
  appId?: number,
  skipAppIds?: number[],
) {
  const respond = (result: any[]) => res.send({
    result,
    meta: params,
  });
  const { storeId } = config.get();
  const isEmptyParams = (!params || !Object.keys(params).length);
  if (!validate(params)) {
    return sendRequestError(res, modName, validate.errors);
  }
  let canCache = true;
  const cacheKey = `${storeId}:${modName}`;
  const listAppsParams: ApiConfig['params'] = {
    state: 'active',
    [`modules.${modName}.enabled`]: true,
    fields: `_id,app_id,version,data,hidden_data,modules.${modName}`,
  };
  if (appId) {
    canCache = false;
    listAppsParams.app_id = appId;
    listAppsParams.limit = 1;
  }
  let canCacheResults = false;
  if (canCache && isEmptyParams) {
    if (resultsCache[cacheKey]) {
      return respond(resultsCache[cacheKey]);
    }
    canCacheResults = true;
  }

  const mockedModApps = global.$activeModuleApps?.filter(({ modules }) => {
    return modules[modName as 'list_payments']?.enabled;
  });
  let appsList: Array<AppModuleBody['application']>;
  if (mockedModApps?.length) {
    appsList = mockedModApps;
  } else if (canCache && appsCache[cacheKey]) {
    appsList = appsCache[cacheKey];
  } else {
    try {
      const { data } = await api.get('applications', {
        params: listAppsParams,
      });
      appsList = data.result as Array<AppModuleBody['application']>;
    } catch (err: any) {
      logger.error(err);
      const error = err as ApiError;
      return res.status(500).send({
        status: 500,
        error_code: 'MOD801',
        message: `Store API returned status ${error.statusCode} trying to list apps`,
        more_info: error.data?.user_message?.en_us,
      });
    }
  }

  if (Array.isArray(appsList)) {
    if (!appsList.length) {
      return respond([]);
    }
    if (canCache && !appsCache[cacheKey]) {
      appsCache[cacheKey] = appsList;
      setTimeout(() => {
        appsCache[cacheKey] = null;
        delete appsCache[cacheKey];
      }, appsList.length ? 30000 : 3000);
    }
    const moduleReqs: Promise<any>[] = [];
    for (let i = 0; i < appsList.length; i++) {
      const application = structuredClone(appsList[i]);
      if (!application.hidden_data) {
        application.hidden_data = {};
      }
      if (!application.data) {
        application.data = {};
      }
      if (!appId && skipAppIds?.find((id) => id === application.app_id)) {
        continue;
      }
      const appModuleUrl = application.modules[modName].endpoint as string;
      // Handle request with big timeout if proxying one app (by ID) only
      const isBigTimeout = !!(appId);
      const appModuleBody: AppModuleBody = {
        storeId,
        module: modName as AppModuleName,
        params,
        application,
      };

      const reqStartTime = Date.now();
      moduleReqs.push(new Promise((resolve) => {
        let response: any;
        let isError = false;
        let errorMessage: string | null = null;
        callAppModule(
          appId || application.app_id,
          modName as AppModuleName,
          appModuleUrl,
          appModuleBody,
          isBigTimeout,
        )
          .then((appResponse) => {
            response = appResponse;
            if (appResponse?.error) {
              isError = true;
              errorMessage = appResponse.message || String(appResponse.error);
            }
          })
          .catch((err: any) => {
            response = null;
            isError = true;
            errorMessage = err.message;
          })
          .finally(() => {
            const result = {
              _id: application._id,
              app_id: application.app_id,
              took: Date.now() - reqStartTime,
              version: application.version,
              validated: false,
              response_errors: null,
              error: isError,
              error_message: errorMessage,
              response,
            };
            if (!isError && typeof response === 'object' && response !== null) {
              result.validated = responseValidate(response);
              if (!result.validated) {
                // @ts-ignore
                result.response_errors = parseAjvErrors(
                  responseValidate.errors,
                  ajvAppsResponse,
                );
              }
            }
            resolve(result);
          });
      }));
    }

    return Promise.all(moduleReqs).then((results) => {
      if (!results.find(({ response }) => response)) {
        res.status(409);
        canCacheResults = false;
      }
      if (canCacheResults && !resultsCache[cacheKey]) {
        resultsCache[cacheKey] = results;
        setTimeout(() => {
          resultsCache[cacheKey] = null;
          delete resultsCache[cacheKey];
        }, 60000);
      }
      return respond(results);
    });
  }
  // Shoud never happen
  return res.sendStatus(501);
}

export default (
  modName: string,
  schema: { [key: string]: any },
  responseSchema: { [key: string]: any },
  req: Request,
  res: Response,
) => {
  const validate = ajv.compile(schema);
  const responseValidate = ajvAppsResponse.compile(responseSchema);
  return {
    GET() {
      res.setHeader(
        'Cache-Control',
        'public, max-age=180, must-revalidate'
          + ', s-maxage=5, stale-while-revalidate=9, stale-if-error=300',
      );
      runModule(req.query, res, modName, validate, responseValidate);
    },
    POST() {
      let appId: undefined | number;
      const qAppId = req.query.app_id;
      if (qAppId) {
        if (typeof qAppId === 'string' && /^\d+$/.test(qAppId)) {
          appId = parseInt(qAppId, 10);
        }
        if (typeof qAppId === 'number' && qAppId > 1) {
          appId = qAppId;
        }
      }
      const skipAppIds: number[] = [];
      const qSkipIds = req.query.skip_ids;
      if (qSkipIds) {
        (Array.isArray(qSkipIds) ? qSkipIds : [qSkipIds]).forEach((qSkipId: any) => {
          if (typeof qSkipId === 'string') {
            qSkipId = parseInt(qSkipId, 10);
          }
          if (typeof qSkipId === 'number' && qSkipId > 1) {
            skipAppIds.push(qSkipId);
          }
        });
      }
      runModule(
        req.body,
        res,
        modName,
        validate,
        responseValidate,
        appId,
        skipAppIds,
      );
    },
  };
};
