import Carousel from '../carousel';
import ProductCard, { Product, ProductCardSkeleton } from '../product-card';

interface Props {
  products?: Product[];
}

export const ProductsCarousel = function ProductsCarousel({ products }: Props) {
  return (
    <Carousel>
      {products && products.length > 0
        ? products.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              className="[&>div]:min-w-[179px] @4xl:[&>div]:min-w-[360px]"
            />
          ))
        : Array.from({ length: 5 }).map((_, index) => (
            <ProductCardSkeleton
              className="[&>div]:min-w-[179px] @4xl:[&>div]:min-w-[360px]"
              key={index}
            />
          ))}
    </Carousel>
  );
};

export default ProductsCarousel;
