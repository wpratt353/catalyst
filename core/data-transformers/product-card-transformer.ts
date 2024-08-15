import { ResultOf } from 'gql.tada';
import { getFormatter } from 'next-intl/server';

import { ProductCardFragment } from '~/client/fragments/product-card';
import { ExistingResultType } from '~/client/util';
import { Product } from '~/components/ui/product-card';

import { pricesTransformer } from './prices-transformer';

export const productCardTransformer = (
  product: ResultOf<typeof ProductCardFragment>,
  format: ExistingResultType<typeof getFormatter>,
): Product => ({
  id: product.entityId.toString(),
  name: product.name,
  href: product.path,
  image: product.defaultImage
    ? { src: product.defaultImage.url, altText: product.defaultImage.altText }
    : undefined,
  price: pricesTransformer(product.prices, format),
  subtitle: product.brand?.name ?? undefined,
  badge: 'new',
});
