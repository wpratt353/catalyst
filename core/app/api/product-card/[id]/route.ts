import { NextRequest, NextResponse } from 'next/server';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { ProductCardFragment } from '~/components/client-product-card/fragment';

const GetProductQuery = graphql(
  `
    query GetProduct($productId: Int!) {
      site {
        product(entityId: $productId) {
          ...ProductCardFragment
        }
      }
    }
  `,
  [ProductCardFragment],
);

export const GET = async (_request: NextRequest, { params }: { params: { id: string } }) => {
  const customerId = await getSessionCustomerId();
  const { id } = params;

  const { data } = await client.fetch({
    document: GetProductQuery,
    variables: { productId: Number(id) },
    customerId,
  });

  return NextResponse.json(data.site.product);
};

export const runtime = 'edge';
