'use server';

import { revalidatePath } from 'next/cache';

import { deleteCustomerAddress } from '~/client/mutations/delete-customer-address';

export const deleteAddress = async (addressId: number) => {
  try {
    const response = await deleteCustomerAddress(addressId);

    revalidatePath('/account/addresses', 'page');

    if (response.customer.deleteCustomerAddress.errors.length === 0) {
      return { status: 'success', message: 'This address has been deleted' };
    }

    return {
      status: 'error',
      message: response.customer.deleteCustomerAddress.errors
        .map((error) => error.message)
        .join('\n'),
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        status: 'error',
        message: error.message,
      };
    }

    return { status: 'error', message: 'Unknown error' };
  }
};
