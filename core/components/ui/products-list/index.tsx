import clsx from 'clsx';

import ProductCard, { Product, ProductCardSkeleton } from '../product-card';

interface Props {
  products?: Product[];
  className?: string;
}

export const ProductsList = function ProductsList({ products, className = '' }: Props) {
  return (
    <div className={clsx('w-full bg-background pt-0.5 @container', className)}>
      <div className="mx-auto grid max-w-screen-2xl grid-cols-1 gap-x-5 gap-y-10 px-3 @md:grid-cols-2 @xl:gap-y-10 @xl:px-6 @4xl:grid-cols-3 @5xl:px-20">
        {products && products.length > 0
          ? products.map((product) => <ProductCard key={product.id} {...product} />)
          : Array.from({ length: 5 }).map((_, index) => <ProductCardSkeleton key={index} />)}
      </div>
    </div>
  );
};

export default ProductsList;
