import { graphql } from '~/client/graphql';

import { ProductCardFragment } from '../product-card';

export const ProductCardCarouselFragment = graphql(
  `
    fragment ProductCardCarouselFragment on Product {
      ...ProductCardFragment
    }
  `,
  [ProductCardFragment],
);
