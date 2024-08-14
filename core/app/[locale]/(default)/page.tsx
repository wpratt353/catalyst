import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { unstable_setRequestLocale } from 'next-intl/server';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import {
  FeaturedProductsCarousel,
  ProductCardCarouselFragment,
} from '~/components/featured-products-carousel';
import { Hero } from '~/components/hero';
import { LocaleType } from '~/i18n';

interface Props {
  params: {
    locale: LocaleType;
  };
}

const HomePageQuery = graphql(
  `
    query HomePageQuery {
      site {
        categoryTree {
          name
          path
        }
        newestProducts(first: 12) {
          edges {
            node {
              ...ProductCardCarouselFragment
            }
          }
        }
        featuredProducts(first: 12) {
          edges {
            node {
              ...ProductCardCarouselFragment
            }
          }
        }
      }
    }
  `,
  [ProductCardCarouselFragment],
);

export default async function Home({ params: { locale } }: Props) {
  unstable_setRequestLocale(locale);

  const customerId = await getSessionCustomerId();

  const { data } = await client.fetch({
    document: HomePageQuery,
    customerId,
    fetchOptions: customerId ? { cache: 'no-store' } : { next: { revalidate } },
  });

  // const featuredProducts = removeEdgesAndNodes(data.site.featuredProducts);
  const newestProducts = removeEdgesAndNodes(data.site.newestProducts);

  return (
    <>
      <Hero />

      <div className="my-10">
        {/* <FeaturedProductsCarousel
          products={featuredProducts}
          title={t('Carousel.featuredProducts')}
        /> */}
        <FeaturedProductsCarousel products={newestProducts} title="New arrivals" />
      </div>
    </>
  );
}

export const runtime = 'edge';
