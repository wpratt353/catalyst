import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { WishlistSheetFragment } from '~/app/[locale]/(default)/account/[tab]/_components/wishlist-sheet/fragment';
import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { BreadcrumbsFragment } from '~/components/breadcrumbs';

import { DescriptionFragment } from './_components/description';
import { DetailsFragment } from './_components/details';
import { GalleryFragment } from './_components/gallery/fragment';
import { WarrantyFragment } from './_components/warranty';

const ProductPageQuery = graphql(
  `
    query ProductPageQuery(
      $entityId: Int!
      $optionValueIds: [OptionValueId!]
      $useDefaultOptionSelections: Boolean
    ) {
      site {
        product(
          entityId: $entityId
          optionValueIds: $optionValueIds
          useDefaultOptionSelections: $useDefaultOptionSelections
        ) {
          ...GalleryFragment
          ...DetailsFragment
          ...DescriptionFragment
          ...WarrantyFragment
          entityId
          name
          defaultImage {
            url: urlTemplate
            altText
          }
          categories(first: 1) {
            edges {
              node {
                ...BreadcrumbsFragment
              }
            }
          }
          seo {
            pageTitle
            metaDescription
            metaKeywords
          }
        }
      }
      customer {
        wishlists {
          ...WishlistSheetFragment
        }
      }
    }
  `,
  [
    BreadcrumbsFragment,
    GalleryFragment,
    DetailsFragment,
    DescriptionFragment,
    WarrantyFragment,
    WishlistSheetFragment,
  ],
);

type ProductPageQueryVariables = VariablesOf<typeof ProductPageQuery>;

export const getProduct = cache(async (variables: ProductPageQueryVariables) => {
  const customerId = await getSessionCustomerId();

  const { data } = await client.fetch({
    document: ProductPageQuery,
    variables,
    customerId,
    fetchOptions: customerId ? { cache: 'no-store' } : { next: { revalidate } },
  });

  const wishlists = data.customer?.wishlists
    ? removeEdgesAndNodes(data.customer.wishlists).map((wishlist) => {
        return {
          ...wishlist,
          items: removeEdgesAndNodes(wishlist.items),
        };
      })
    : [];

  return { product: data.site.product, wishlists };
});
