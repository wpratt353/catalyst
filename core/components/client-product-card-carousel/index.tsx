'use client';

import { useEffect, useId, useState } from 'react';

import { ResultOf } from '~/client/graphql';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNextIndicator,
  CarouselPreviousIndicator,
} from '~/components/ui/carousel';

import { ClientProductCard } from '../client-product-card';

import { ProductCardCarouselFragment } from './fragment';
import { Pagination } from './pagination';

type Product = ResultOf<typeof ProductCardCarouselFragment>;

export const ClientProductCardCarousel = ({
  title,
  showCart = true,
  showCompare = true,
  showReviews = true,
  type = 'featured',
}: {
  title: string;
  showCart?: boolean;
  showCompare?: boolean;
  showReviews?: boolean;
  type?: 'newest' | 'featured';
}) => {
  const id = useId();
  const titleId = useId();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch(`/api/product-card-carousel/${type}`);
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const data = (await response.json()) as Product[];

      setProducts(data);
    };

    void fetchProducts();
  }, [type]);

  if (products.length === 0) {
    return null;
  }

  const groupedProducts = products.reduce<Product[][]>((batches, _, index) => {
    if (index % 4 === 0) {
      batches.push([]);
    }

    const product = products[index];

    if (batches[batches.length - 1] && product) {
      batches[batches.length - 1]?.push(product);
    }

    return batches;
  }, []);

  return (
    <Carousel aria-labelledby={titleId} className="mb-14" opts={{ loop: true }}>
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black lg:text-4xl" id={titleId}>
          {title}
        </h2>
        <span className="no-wrap flex">
          <CarouselPreviousIndicator />
          <CarouselNextIndicator />
        </span>
      </div>
      <CarouselContent>
        {groupedProducts.map((group, index) => (
          <CarouselItem
            aria-label={`${index + 1} of ${groupedProducts.length}`}
            id={`${id}-slide-${index + 1}`}
            index={index}
            key={index}
          >
            {group.map((product) => (
              <ClientProductCard
                imageSize="tall"
                key={product.entityId}
                product={product}
                showCart={showCart}
                showCompare={showCompare}
                showReviews={showReviews}
              />
            ))}
          </CarouselItem>
        ))}
      </CarouselContent>
      <Pagination groupedProducts={groupedProducts} id={id} />
    </Carousel>
  );
};
