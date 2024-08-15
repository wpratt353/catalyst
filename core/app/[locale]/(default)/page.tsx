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
import { FeaturedProductsList } from '~/components/featured-products-list';
import { Slideshow } from '~/components/slideshow';
import FeaturedImage from '~/components/ui/featured-image';
import SubscribeBasic from '~/components/ui/subscribe-basic';
import { LocaleType } from '~/i18n';

import image from './_images/featured1.jpg';

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
        featuredProducts(first: 6) {
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

  const featuredProducts = removeEdgesAndNodes(data.site.featuredProducts);
  const newestProducts = removeEdgesAndNodes(data.site.newestProducts);

  return (
    <>
      <Slideshow />

      <div className="my-10">
        <FeaturedProductsCarousel products={newestProducts} title="New arrivals" />

        <FeaturedImage
          cta={{ href: '/#', label: 'Shop now' }}
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt."
          image={{
            src: image,
            altText: 'An assortment of brandless products against a blank background',
          }}
          title="Title"
        />

        <FeaturedProductsList
          cta={{ href: '/#', label: 'Shop now' }}
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
          products={featuredProducts}
          title="Featured products"
        />

        <FeaturedProductsCarousel products={featuredProducts} title="Recently viewed" />

        <SubscribeBasic
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor."
          title="Sign up for our newsletter"
        />
      </div>
    </>
  );
}

export const runtime = 'edge';
