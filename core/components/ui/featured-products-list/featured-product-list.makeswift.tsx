import { Select, Style, TextInput } from '@makeswift/runtime/controls';
import { useFormatter } from 'next-intl';
import useSWR, { Fetcher } from 'swr';

import { ProductCardFragment } from '~/client/fragments/product-card';
import { ResultOf } from '~/client/graphql';
import { FeaturedProductsList } from '~/components/ui/featured-products-list';
import { productCardTransformer } from '~/data-transformers/product-card-transformer';
import { fetcher } from '~/lib/fetcher';
import { runtime } from '~/lib/makeswift/runtime';

interface Props {
  title: string;
  description: string;
  type: 'newest' | 'featured';
  className?: string;
}

type ProductData = ResultOf<typeof ProductCardFragment>;

const typedFetcher: Fetcher<ProductData[], string> = fetcher;

runtime.registerComponent(
  function MakeswiftProductList({ title, description, type, className }: Props) {
    const format = useFormatter();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data, error, isLoading } = useSWR(`/api/carousel/${type}`, typedFetcher);

    if (isLoading) {
      return (
        <div className={className}>
          <div className="flex h-96 w-96 gap-4">
            <div className="aspect-[4/3] animate-pulse bg-contrast-100" />
            <div className="aspect-[4/3] animate-pulse bg-contrast-100" />
            <div className="aspect-[4/3] animate-pulse bg-contrast-100" />
            <div className="aspect-[4/3] animate-pulse bg-contrast-100" />
          </div>{' '}
        </div>
      );
    }

    if (error) {
      return <div className={className}>Error loading products</div>;
    }

    if (!data) {
      return <div className={className}>No products found</div>;
    }

    return (
      <div className={className}>
        <FeaturedProductsList
          cta={{ href: '/#', label: 'Shop now' }}
          description={description}
          products={data.map((product) => productCardTransformer(product, format))}
          title={title}
        />
      </div>
    );
  },
  {
    type: 'catalyst-featured-product-list',
    label: 'Catalyst / Featured Product List',
    props: {
      className: Style(),
      title: TextInput({ label: 'Title', defaultValue: 'Featured Products' }),
      description: TextInput({ label: 'Description', defaultValue: 'Description' }),
      type: Select({
        label: 'Type',
        options: [
          { label: 'Newest', value: 'newest' },
          { label: 'Featured', value: 'featured' },
        ],
        defaultValue: 'featured',
      }),
    },
  },
);
