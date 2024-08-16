import { Select, Style, TextInput } from '@makeswift/runtime/controls';
import { useFormatter } from 'next-intl';
import { useEffect, useState } from 'react';

import { ProductCardFragment } from '~/client/fragments/product-card';
import { ResultOf } from '~/client/graphql';
import { FeaturedProductsCarousel } from '~/components/ui/featured-products-carousel';
import { Product } from '~/components/ui/product-card';
import { productCardTransformer } from '~/data-transformers/product-card-transformer';
import { runtime } from '~/lib/makeswift/runtime';

interface Props {
  title: string;
  type: 'newest' | 'featured';
  className?: string;
}

type ProductData = ResultOf<typeof ProductCardFragment>;

runtime.registerComponent(
  function MakeswiftCarousel({ title, type, className }: Props) {
    const format = useFormatter();
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
      const fetchProducts = async () => {
        const response = await fetch(`/api/carousel/${type}`);
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const data = (await response.json()) as ProductData[];

        const newestProducts = data.map((product) => productCardTransformer(product, format));

        setProducts(newestProducts);
      };

      void fetchProducts();
    }, [type, format]);

    return (
      <div className={className}>
        <FeaturedProductsCarousel products={products} title={title} />
      </div>
    );
  },
  {
    type: 'catalyst-carousel',
    label: 'Catalyst / Carousel',
    props: {
      className: Style(),
      title: TextInput({ label: 'Title', defaultValue: 'Carousel' }),
      type: Select({
        label: 'Type',
        options: [
          { label: 'Newest', value: 'newest' },
          { label: 'Featured', value: 'featured' },
        ],
        defaultValue: 'newest',
      }),
    },
  },
);
