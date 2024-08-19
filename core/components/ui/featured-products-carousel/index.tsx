import { Link as CustomLink } from '~/components/link';

import { Product } from '../product-card';
import ProductsCarousel from '../products-carousel';

interface Link {
  label: string;
  href: string;
}

interface Props {
  title: string;
  description?: string;
  cta?: Link;
  products: Product[];
}

export const FeaturedProductsCarousel = function FeaturedProductsCarousel({
  title,
  description,
  cta,
  products,
}: Props) {
  return (
    <section className="@container">
      <div className="text-foreground mx-auto flex w-full max-w-screen-2xl flex-row flex-wrap justify-between gap-5 px-3 pt-10 @xl:px-6 @4xl:items-end @5xl:px-20">
        <div className="flex flex-col gap-5">
          {title && <h2 className="font-heading text-2xl font-medium leading-none">{title}</h2>}
          {description && <p className="text-contrast-400 max-w-md">{description}</p>}
        </div>
        {cta && (
          <CustomLink
            className="text-foreground rounded-lg font-semibold ring-primary focus-visible:outline-0 focus-visible:ring-2"
            href={cta.href}
          >
            {cta.label}
          </CustomLink>
        )}
      </div>
      <ProductsCarousel products={products} />
    </section>
  );
};

export default FeaturedProductsCarousel;
