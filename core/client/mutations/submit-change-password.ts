import { client } from '..';
import { graphql, VariablesOf } from '../graphql';

const SUBMIT_CHANGE_PASSWORD_MUTATION = graphql(`
  mutation ChangePassword($input: ResetPasswordInput!) {
    customer {
      resetPassword(input: $input) {
        __typename
        errors {
          __typename
          ... on Error {
            message
          }
        }
      }
    }
  }
`);

type ChangePasswordInput = VariablesOf<typeof SUBMIT_CHANGE_PASSWORD_MUTATION>['input'];

export const submitChangePassword = async ({
  newPassword,
  token,
  customerEntityId,
}: ChangePasswordInput) => {
  const variables = {
    input: {
      token,
      customerEntityId,
      newPassword,
    },
  };

  const response = await client.fetch({
    document: SUBMIT_CHANGE_PASSWORD_MUTATION,
    variables,
  });

  return response.data.customer.resetPassword;
};
