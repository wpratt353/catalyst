'use server';

import { updateCustomer as updateCustomerClient } from '~/client/mutations/update-customer';

export const updateCustomer = async (formData: FormData) => {
  const formFields = Object.fromEntries(formData.entries());

  const response = await updateCustomerClient({ formFields });

  if (response.errors.length === 0) {
    const { customer } = response;

    if (!customer) {
      return {
        status: 'error',
        error: 'Customer does not exist',
      };
    }

    const { firstName, lastName } = customer;

    return { status: 'success', data: { firstName, lastName } };
  }

  return {
    status: 'error',
    error: response.errors.map((error) => error.message).join('\n'),
  };
};
