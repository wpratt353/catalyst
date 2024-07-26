import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { FORM_FIELDS_VALUES_FRAGMENT } from '~/client/fragments/form-fields-values';
import { PaginationFragment } from '~/client/fragments/pagination';
import { graphql } from '~/client/graphql';

const GetCustomerAddressesQuery = graphql(
  `
    query GetCustomerAddressesQuery($after: String, $before: String, $first: Int, $last: Int) {
      customer {
        entityId
        addresses(before: $before, after: $after, first: $first, last: $last) {
          pageInfo {
            ...PaginationFragment
          }
          collectionInfo {
            totalItems
          }
          edges {
            node {
              entityId
              firstName
              lastName
              address1
              address2
              city
              stateOrProvince
              countryCode
              phone
              postalCode
              company
              formFields {
                ...FormFieldsValues
              }
            }
          }
        }
      }
    }
  `,
  [PaginationFragment, FORM_FIELDS_VALUES_FRAGMENT],
);

export interface CustomerAddressesArgs {
  after?: string;
  before?: string;
  limit?: number;
}

export const getCustomerAddresses = cache(
  async ({ before = '', after = '', limit = 9 }: CustomerAddressesArgs) => {
    const customerAccessToken = await getSessionCustomerAccessToken();
    const paginationArgs = before ? { last: limit, before } : { first: limit, after };

    const response = await client.fetch({
      document: GetCustomerAddressesQuery,
      variables: { ...paginationArgs },
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });

    const addresses = response.data.customer?.addresses;

    if (!addresses) {
      return undefined;
    }

    return {
      pageInfo: addresses.pageInfo,
      addressesCount: addresses.collectionInfo?.totalItems ?? 0,
      addresses: removeEdgesAndNodes({ edges: addresses.edges }),
    };
  },
);
