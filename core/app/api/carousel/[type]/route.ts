import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { NextRequest, NextResponse } from 'next/server';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { ProductCardFragment } from '~/client/fragments/product-card';
import { graphql } from '~/client/graphql';

const GetProductCardCarousel = graphql(
  `
    query GetProductCardCarousel {
      site {
        newestProducts(first: 12) {
          edges {
            node {
              ...ProductCardFragment
            }
          }
        }
        featuredProducts(first: 12) {
          edges {
            node {
              ...ProductCardFragment
            }
          }
        }
      }
    }
  `,
  [ProductCardFragment],
);

export const GET = async (
  _request: NextRequest,
  { params }: { params: { type: 'newest' | 'featured' } },
) => {
  const customerId = await getSessionCustomerId();
  const { type } = params;

  const { data } = await client.fetch({
    document: GetProductCardCarousel,
    customerId,
  });

  if (type === 'newest') {
    return NextResponse.json(removeEdgesAndNodes(data.site.newestProducts));
  }

  return NextResponse.json(removeEdgesAndNodes(data.site.featuredProducts));
};

export const runtime = 'edge';
