import clsx from 'clsx';
import { ComponentPropsWithoutRef } from 'react';

export type ProductPrice =
  | string
  | {
      type: 'sale';
      currentValue: string;
      previousValue: string;
    }
  | {
      type: 'range';
      minValue: string;
      maxValue: string;
    };

export default function Price({
  price,
  className = '',
}: { price: ProductPrice; className?: string } & ComponentPropsWithoutRef<'span'>) {
  if (typeof price === 'string') {
    return (
      <span className={clsx('text-sm font-semibold @4xl:text-xl @4xl:font-medium', className)}>
        {price}
      </span>
    );
  }

  switch (price.type) {
    case 'range':
      return (
        <span className={clsx('text-sm font-semibold @4xl:text-xl @4xl:font-medium', className)}>
          {price.minValue} - {price.maxValue}
        </span>
      );

    case 'sale':
      return (
        <span className={clsx('text-sm font-semibold @4xl:text-xl @4xl:font-medium', className)}>
          <span className="text-contrast-400 font-normal line-through">{price.previousValue}</span>{' '}
          {price.currentValue}
        </span>
      );

    default:
      return null;
  }
}
