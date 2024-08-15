import { ResultOf } from 'gql.tada';
import { getFormatter } from 'next-intl/server';

import { pricesTransformer } from '~/data-transformers/prices-transformer';

import { ProductCardCarouselFragment } from '../featured-products-carousel';
import { FeaturedProductsList as ComponentsFeaturedProductList } from '../ui/featured-product-list';

type Product = ResultOf<typeof ProductCardCarouselFragment>;

export const FeaturedProductsList = async ({
  cta,
  description,
  title,
  products,
}: {
  cta?: { label: string; href: string };
  description?: string;
  title: string;
  products: Product[];
}) => {
  const format = await getFormatter();

  if (products.length === 0) {
    return null;
  }

  const formattedProducts = products.map((product) => ({
    id: product.entityId.toString(),
    name: product.name,
    href: product.path,
    image: product.defaultImage
      ? { src: product.defaultImage.url, altText: product.defaultImage.altText }
      : undefined,
    price: pricesTransformer(product.prices, format),
    subtitle: product.brand?.name ?? undefined,
    badge: 'new',
  }));

  return (
    <ComponentsFeaturedProductList
      cta={cta}
      description={description}
      products={formattedProducts}
      title={title}
    />
  );
};
