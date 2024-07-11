import { client } from '..';
import { graphql } from '../graphql';

const GET_SHIPPING_ESTIMATOR_QUERY = graphql(`
  query getShippingEstimatorCountries {
    geography {
      countries {
        code
        entityId
        name
        __typename
        statesOrProvinces {
          abbreviation
          entityId
          name
          __typename
        }
      }
    }
  }
`);

export const getShippingEstimatorCountries = async (channelId?: string) => {
  const { data } = await client.fetch({
    document: GET_SHIPPING_ESTIMATOR_QUERY,
    fetchOptions: { next: { revalidate: 2678400 } }, // cache for one month
    channelId,
  });

  return data.geography.countries;
};
