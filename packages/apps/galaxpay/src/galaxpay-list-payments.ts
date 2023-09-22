import type {
  AppModuleBody,
  ListPaymentsParams,
  ListPaymentsResponse,
} from '@cloudcommerce/types';
import type { GalaxpayApp } from '../types/config-app';
import logger from 'firebase-functions/logger';
import { readFile, responseError, isSandbox } from './functions-lib/utils';
import { handleGateway, discountPlan } from './functions-lib/galaxpay/handle-plans';
import { parsePeriodicityToEcom } from './functions-lib/all-parses';

type Gateway = ListPaymentsResponse['payment_gateways'][number]
type CodePaymentMethod = Gateway['payment_method']['code']

export default async (data: AppModuleBody) => {
  const { application } = data;
  const params = data.params as ListPaymentsParams;
  // https://apx-mods.e-com.plus/api/v1/list_payments/schema.json?store_id=100
  let amount = { ...params.amount } || { total: undefined, discount: undefined };
  // const initialTotalAmount = amount.total;

  const configApp = {
    ...application.data,
    ...application.hidden_data,
  } as GalaxpayApp;

  // setup basic required response object
  const response: ListPaymentsResponse = {
    payment_gateways: [],
  };

  if (!process.env.GALAXPAY_ID) {
    const galaxpayId = configApp.galaxpay_id;
    if (galaxpayId && typeof galaxpayId === 'string') {
      process.env.GALAXPAY_ID = galaxpayId;
    } else {
      logger.warn('Missing GalaxPay ID');
    }
  }

  if (!process.env.GALAXPAY_HASH) {
    const galaxpayHash = configApp.galaxpay_hash;
    if (galaxpayHash && typeof galaxpayHash === 'string') {
      process.env.GALAXPAY_HASH = galaxpayHash;
    } else {
      logger.warn('Missing GalaxPay Hash');
    }
  }

  if (!process.env.GALAXPAY_ID || !process.env.GALAXPAY_HASH) {
    return responseError(
      409,
      'NO_GALAXPAY_KEYS',
      'GalaxPay ID e/ou GalaxPay Hash da API indefinido(s) (lojista deve configurar o aplicativo)',
    );
  }

  // common payment methods data
  const intermediator = {
    name: 'GalaxPay',
    link: `https://api.${isSandbox ? 'sandbox.cloud.' : ''}galaxpay.com.br/v2`,
    code: 'galaxpay_app',
  };

  const paymentTypes: Gateway['type'][] = [];
  if (configApp.plans) {
    paymentTypes.push('recurrence');
  }

  // setup payment gateway objects
  const plans = handleGateway(configApp);

  plans.forEach((plan) => {
    ['credit_card', 'banking_billet', 'pix'].forEach((paymentMethod) => {
      paymentTypes.forEach((type) => {
        const methodConfig = configApp[paymentMethod] || {};
        const methodMinAmount = methodConfig.min_amount || 0;
        if (!methodConfig.disable && (amount.total && methodMinAmount <= amount.total)) {
          logger.log('> Plan ', plan.periodicity);

          const isCreditCard = paymentMethod === 'credit_card';
          const isPix = paymentMethod === 'pix';
          let { label } = methodConfig;
          if (!label) {
            if (isCreditCard) {
              label = 'Cartão de crédito';
            } else {
              label = isPix ? 'PIX' : 'Boleto bancário';
            }
          }

          const periodicity = parsePeriodicityToEcom(plan.periodicity);
          const planName = plan.label ? plan.label : 'Plano';

          if (type === 'recurrence' && planName) {
            label = `${planName}`;
          }
          const gateway: Gateway = {
            label,
            icon: methodConfig.icon,
            text: methodConfig.text,
            payment_method: {
              code: isPix ? 'account_deposit' : paymentMethod as CodePaymentMethod, // pix is defined payment method outher
              name: `${label} - ${periodicity} - ${intermediator.name}`,
            },
            type,
            intermediator,
          };

          if (isCreditCard) {
            if (!gateway.icon) {
              // Alternative solution
              gateway.icon = 'https://ecom-galaxpay.web.app/credit-card.png';
              // TODO:
            }
            // https://docs.galaxpay.com.br/tokenizacao-cartao-js
            gateway.js_client = {
              script_uri: 'https://js.galaxpay.com.br/checkout.min.js',
              onload_expression: `window._galaxPayPublicToken="${configApp.galaxpay_public_token}";
              window._galaxPaySandbox=${isSandbox};
              ${readFile('../../assets/onload-expression.min.js')}`,
              cc_hash: {
                function: '_galaxyHashcard',
                is_promise: true,
              },
            };
          }

          const handleDiscount = discountPlan(label, plan, amount);
          if (handleDiscount) {
            amount = handleDiscount.amount;
            gateway.discount = handleDiscount.discount;
            response.discount_option = handleDiscount.discountOption;
          }
          response.payment_gateways.push(gateway);
        }
      });
    });
  });
  return response;
};
