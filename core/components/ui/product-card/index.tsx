import clsx from 'clsx';
// import Image from 'next/image';
// import Link from 'next/link'
import { ComponentPropsWithoutRef } from 'react';

import { BcImage } from '~/components/bc-image';
import { Link as CustomLink } from '~/components/link';

import Badge from '../badge';

import Price, { ProductPrice } from './price';

// import Badge from '@/vibes/soul/components/badge';
// import Compare from '@/vibes/soul/components/product-card/compare'
// import Price, { ProductPrice } from '@/vibes/soul/components/product-card/price';

interface Image {
  altText: string;
  src: string;
}

export interface Product {
  id: string;
  name: string;
  href: string;
  image?: Image;
  price?: ProductPrice;
  subtitle?: string;
  badge?: string;
  className?: string;
}

export const ProductCard = function ProductCard({
  id,
  name,
  href,
  image,
  price,
  subtitle,
  badge,
  className,
}: Product & ComponentPropsWithoutRef<'a'>) {
  return (
    <CustomLink
      className={clsx(
        'group relative flex cursor-pointer flex-col gap-2 rounded-xl text-foreground ring-primary focus-visible:outline-0 focus-visible:ring-2',
        className,
      )}
      href={href}
      id={id}
    >
      <div className="relative aspect-[5/6] overflow-hidden rounded-xl @6xl:min-w-[300px]">
        {badge && (
          <Badge className="absolute left-2.5 top-2.5 @4xl:left-4 @4xl:top-4">{badge}</Badge>
        )}
        {image && (
          <BcImage
            alt="Category card image"
            className="w-full select-none bg-contrast-100 object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
            fill
            src={image.src}
          />
        )}
        {/* {checked !== undefined && setChecked && (
          <Compare label="Compare" checked={checked} setChecked={setChecked} />
        )} */}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="flex flex-col flex-wrap justify-between gap-1 text-sm font-semibold @sm:pt-3 @4xl:flex-row">
          {name && <span className="line-clamp-2">{name}</span>}
          {subtitle && <span className="font-normal text-contrast-400">{subtitle}</span>}
        </h3>
        {price && <Price price={price} />}
      </div>
    </CustomLink>
  );
};

export default ProductCard;
