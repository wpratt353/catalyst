import * as LabelPrimitive from '@radix-ui/react-label';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

// FIX CLASS OVERRIDES IN USAGE
import { cn } from '~/lib/utils';

export const Label = forwardRef<
  ElementRef<typeof LabelPrimitive.Root>,
  ComponentPropsWithRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root className={cn('font-semibold', className)} ref={ref} {...props} />
));

Label.displayName = LabelPrimitive.Label.displayName;
