import { getFormatter } from 'next-intl/server';

import { graphql, ResultOf } from '~/client/graphql';
import { FeaturedProductsCarousel as ComponentsFeaturedProductsCarousel } from '~/components/ui/featured-products-carousel';
import { pricesTransformer } from '~/data-transformers/prices-transformer';

export const PricingFragment = graphql(`
  fragment PricingFragment on Product {
    prices {
      price {
        value
        currencyCode
      }
      basePrice {
        value
        currencyCode
      }
      retailPrice {
        value
        currencyCode
      }
      salePrice {
        value
        currencyCode
      }
      priceRange {
        min {
          value
          currencyCode
        }
        max {
          value
          currencyCode
        }
      }
    }
  }
`);

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
      reviewSummary {
        numberOfReviews
        averageRating
      }
      ...PricingFragment
    }
  `,
  [PricingFragment],
);

export const ProductCardCarouselFragment = graphql(
  `
    fragment ProductCardCarouselFragment on Product {
      ...ProductCardFragment
    }
  `,
  [ProductCardFragment],
);

type Product = ResultOf<typeof ProductCardCarouselFragment>;

export const FeaturedProductsCarousel = async ({
  title,
  products,
}: {
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

  return <ComponentsFeaturedProductsCarousel products={formattedProducts} title={title} />;
};
