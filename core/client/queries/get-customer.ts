import { cache } from 'react';

import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { graphql } from '../graphql';

const GET_CUSTOMER_QUERY = graphql(`
  query getCustomer {
    customer {
      entityId
      company
      email
      firstName
      lastName
      phone
      formFields {
        entityId
        name
        __typename
        ... on CheckboxesFormFieldValue {
          valueEntityIds
          values
        }
        ... on DateFormFieldValue {
          date {
            utc
          }
        }
        ... on MultipleChoiceFormFieldValue {
          valueEntityId
          value
        }
        ... on NumberFormFieldValue {
          number
        }
        ... on PasswordFormFieldValue {
          password
        }
        ... on TextFormFieldValue {
          text
        }
      }
    }
  }
`);

export const getCustomer = cache(async () => {
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: GET_CUSTOMER_QUERY,
    fetchOptions: { cache: 'no-store' },
    customerId,
  });

  const customer = response.data.customer;

  if (!customer) {
    return null;
  }

  return customer;
});
