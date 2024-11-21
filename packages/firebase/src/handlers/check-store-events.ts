import type {
  Resource,
  ResourceId,
  ApiEventName,
  AppEventsPayload,
  EventsResult,
} from '@cloudcommerce/types';
import { getFirestore } from 'firebase-admin/firestore';
import { PubSub } from '@google-cloud/pubsub';
import api, { ApiConfig } from '@cloudcommerce/api';
import config, { logger } from '../config';
import { EVENT_SKIP_FLAG, GET_PUBSUB_TOPIC } from '../const';

declare global {
  // eslint-disable-next-line
  var $transformApiEvents: undefined | (
    <T extends Resource>(
      resource: T,
      result: EventsResult<`events/${T}`>['result'],
    ) => Promise<EventsResult<`events/${T}`>['result']>
  );
}

const parseEventName = (
  evName: ApiEventName,
  baseApiEventsFilter: Record<string, string>,
) => {
  const [resource, actionName] = evName.split('-');
  const params: ApiConfig['params'] = { ...baseApiEventsFilter };
  const bodySet: { [key: string]: any } = {};
  if (actionName === 'new' || actionName === 'delayed') {
    params.action = 'create';
  } else {
    switch (resource) {
      case 'orders':
        switch (actionName) {
          case 'paid':
            bodySet['financial_status.current'] = 'paid';
            break;
          case 'readyForShipping':
            bodySet['fulfillment_status.current'] = 'ready_for_shipping';
            break;
          case 'shipped':
          case 'delivered':
            bodySet['fulfillment_status.current'] = actionName;
            break;
          case 'cancelled':
            bodySet.status = 'cancelled';
            break;
          default: // anyStatusSet
            params.modified_fields = [
              'financial_status',
              'fulfillment_status',
              'status',
            ];
        }
        break;
      case 'products':
        params.modified_fields = actionName === 'priceSet'
          ? ['price', 'variations.price']
          : ['quantity']; // quantitySet
        break;
      case 'carts':
        params.modified_fields = ['customers']; // customerSet
        break;
      case 'applications':
        params.modified_fields = ['data', 'hidden_data']; // dataSet
        break;
      default:
    }
  }
  Object.keys(bodySet).forEach((field) => {
    params[`body.${field}`] = bodySet[field];
  });
  return { resource, params, actionName } as {
    resource: Resource,
    params: Exclude<ApiConfig['params'], undefined | string>,
    actionName: string
  };
};

const pubSubClient = new PubSub();
const tryPubSubPublish = async (
  topicName: string,
  messageObj: { messageId: string, json: any, orderingKey: string },
  retries = 0,
) => {
  // https://cloud.google.com/pubsub/docs/samples/pubsub-publisher-retry-settings
  const pubSubTopic = pubSubClient.topic(topicName, {
    messageOrdering: true,
    gaxOpts: {
      retry: {
        retryCodes: [10, 1, 4, 13, 8, 14, 2],
        backoffSettings: {
          initialRetryDelayMillis: /* 100 */ 1200,
          retryDelayMultiplier: /* 1.3 */ 2,
          maxRetryDelayMillis: /* 60000 */ 120000,
          initialRpcTimeoutMillis: 5000,
          rpcTimeoutMultiplier: 1.0,
          maxRpcTimeoutMillis: 600000,
          totalTimeoutMillis: 600000,
        },
      },
    },
  });
  try {
    await pubSubTopic.publishMessage(messageObj);
  } catch (err: any) {
    // eslint-disable-next-line no-param-reassign
    err.retries = retries;
    logger.error(err);
    if (retries <= 3) {
      await new Promise((resolve) => {
        setTimeout(() => {
          tryPubSubPublish(topicName, messageObj, retries + 1).then(resolve);
        }, 1000 * (2 ** retries));
      });
    }
  }
};

export default async () => {
  const timestamp = Date.now();
  const documentRef = getFirestore().doc('storeEvents/last');
  const documentSnapshot = await documentRef.get();
  const lastRunTimestamp: number = documentSnapshot.get('timestamp')
    || Date.now() - 1000 * 60 * 5;
  const lastNonOrdersTimestamp: number = documentSnapshot.get('nonOrdersTimestamp')
    || 0;
  const baseApiEventsFilter = {
    'flag!': EVENT_SKIP_FLAG,
    'timestamp>': new Date(lastRunTimestamp - 1).toISOString(),
    'timestamp<': new Date(timestamp).toISOString(),
  };
  const { apiEvents, apps } = config.get();
  const subscribersApps: Array<{ appId: number, events: ApiEventName[] }> = [];
  Object.keys(apps).forEach((appName) => {
    const appObj = apps[appName];
    if (appObj.events && appObj.events.length) {
      subscribersApps.push(appObj);
    }
  });
  const activeApps = (await api.get('applications', {
    params: {
      state: 'active',
      app_id: subscribersApps.map(({ appId }) => appId),
      fields: '_id,app_id,data,hidden_data',
    },
  })).data.result as Array<AppEventsPayload['app']>;
  const listenedEvents: ApiEventName[] = [];
  subscribersApps.forEach(({ appId, events }) => {
    if (activeApps.find((app) => app.app_id === appId)) {
      events.forEach((evName) => {
        if (
          !listenedEvents.includes(evName)
          && !apiEvents.disabledEvents.includes(evName)
        ) {
          listenedEvents.push(evName);
        }
      });
    }
  });
  // Some resource events are not listened to every minute
  const isOrdersOnly = Boolean(new Date().getMinutes() % 5);
  listenedEvents.forEach(async (listenedEventName) => {
    const {
      resource,
      params,
      actionName,
    } = parseEventName(listenedEventName, baseApiEventsFilter);
    if (resource !== 'orders') {
      if (isOrdersOnly) {
        return;
      }
      if (lastNonOrdersTimestamp) {
        if (actionName === 'delayed') {
          // Defines the limits for getting events with predefined delay
          const { delayedMs } = apiEvents;
          params['timestamp>'] = new Date(lastNonOrdersTimestamp - delayedMs).toISOString();
          params['timestamp<'] = new Date(timestamp - delayedMs).toISOString();
        } else {
          params['timestamp>'] = new Date(lastNonOrdersTimestamp).toISOString();
        }
      }
    }
    let { data: { result } } = await api.get(`events/${resource}`, {
      params,
    });
    /*
    global.$transformApiEvents = async (resource: string, result: EventsResult) => {
      if (resource === 'orders') {
        await axios.port(url, result);
      }
      return result;
    };
    */
    const { $transformApiEvents } = global;
    if (typeof $transformApiEvents === 'function') {
      result = await $transformApiEvents(resource, result);
    }
    if (!result.length) return;
    logger.info(`> '${listenedEventName}' ${result.length} events`);
    const eventsPerId: Record<ResourceId, typeof result> = {};
    result.forEach((apiEvent) => {
      const resourceId = apiEvent.resource_id;
      if (!eventsPerId[resourceId]) {
        eventsPerId[resourceId] = [];
      }
      eventsPerId[resourceId].push(apiEvent);
    });
    Object.keys(eventsPerId).forEach(async (key) => {
      const resourceId = key as ResourceId;
      const ascOrderedEvents = eventsPerId[resourceId].sort((a, b) => {
        if (a.timestamp < b.timestamp) return -1;
        return 1;
      });
      const apiDoc = resource !== 'applications'
        ? (await api.get(`${(resource as 'orders')}/${resourceId}`)).data
        : null;
      for (let i = 0; i < ascOrderedEvents.length; i++) {
        const apiEvent = ascOrderedEvents[i];
        apiEvent.resource = resource;
        // "Ensure" messages publishing order
        /* eslint-disable no-await-in-loop */
        if (i > 0) {
          await new Promise((resolve) => { setTimeout(resolve, i * 150); });
        }
        await Promise.all(activeApps.map((app) => {
          const appConfig = subscribersApps.find(({ appId }) => appId === app.app_id);
          if (appConfig?.events.includes(listenedEventName)) {
            const topicName = GET_PUBSUB_TOPIC(app.app_id);
            const json: AppEventsPayload = {
              evName: listenedEventName,
              apiEvent,
              apiDoc: apiDoc || app,
              app,
            };
            const messageObj = {
              messageId: `${resourceId}_${apiEvent.timestamp}`,
              json,
              orderingKey: resourceId,
            };
            return tryPubSubPublish(topicName, messageObj);
          }
          return null;
        }));
        /* eslint-enable no-await-in-loop */
      }
    });
    logger.info(`> '${listenedEventName}' events: `, {
      result: result.map((apiEvent) => ({
        timestamp: apiEvent.timestamp,
        resource_id: apiEvent.resource_id,
      })),
    });
  });
  return documentRef.set({
    timestamp,
    nonOrdersTimestamp: isOrdersOnly ? lastNonOrdersTimestamp : timestamp,
    activeApps,
    listenedEvents,
  });
};
