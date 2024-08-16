import { graphql } from '../graphql';

import { PricingFragment } from './pricing';

export const ProductCardFragment = graphql(
  `
    fragment ProductCardFragment on Product {
      entityId
      name
      defaultImage {
        altText
        url: urlTemplate
      }
      path
      brand {
        name
        path
      }
      ...PricingFragment
    }
  `,
  [PricingFragment],
);
