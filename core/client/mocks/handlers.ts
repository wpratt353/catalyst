/* eslint-disable */

import { graphql, HttpResponse } from 'msw';

const storeHash = process.env.BIGCOMMERCE_STORE_HASH;
const channelId = process.env.BIGCOMMERCE_CHANNEL_ID;
const graphqlApiDomain = process.env.BIGCOMMERCE_GRAPHQL_API_DOMAIN ?? 'mybigcommerce.com';

if (!storeHash) {
  throw new Error('Missing store hash')
}

if (!channelId) {
  throw new Error('Missing channel id')
}

graphql.link(`https://store-${storeHash}-${channelId}.${graphqlApiDomain}/graphql`);

export const handlers = [
  graphql.mutation('registerCustomer', ({ query, variables }) => {
    const { input, reCaptchaV2 } = variables;

    console.log('Intercepted a "registerCustomer" mutation:', { query, input });

    return HttpResponse.json({
      data: {
        customer: {
          registerCustomer: {
            customer: {
              firstName: input.firstName,
              lastName: input.lastName,
            },
            errors: [],
          },
        },
      },
    });
  }),
];
