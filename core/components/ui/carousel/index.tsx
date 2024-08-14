'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ComponentPropsWithoutRef, ReactNode, useCallback, useEffect, useState } from 'react';

import ScrollBar from './scrollbar';

// import ScrollBar from '@/vibes/soul/components/carousel/scrollbar'

interface Props {
  children: ReactNode;
}

export const Carousel = ({ children }: Props & ComponentPropsWithoutRef<'div'>) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section className="mx-auto flex w-full max-w-screen-2xl flex-col gap-10 pt-10 @container">
      {children && (
        <div className="w-full overflow-hidden px-3 py-0.5 @xl:px-6 @5xl:px-20" ref={emblaRef}>
          <div className="flex gap-2 @4xl:gap-5">{children}</div>
        </div>
      )}

      <div className="flex items-center justify-between px-3 pb-3 @xl:px-6 @4xl:pb-20 @5xl:px-20">
        <ScrollBar emblaApi={emblaApi} />
        <div className="flex gap-2 text-foreground">
          <button
            className="rounded-lg ring-primary transition-colors duration-300 focus-visible:outline-0 focus-visible:ring-2 disabled:pointer-events-none disabled:text-contrast-300"
            disabled={!canScrollPrev}
            onClick={scrollPrev}
            role="button"
          >
            <ArrowLeft strokeWidth={1.5} />
          </button>
          <button
            className="rounded-lg ring-primary transition-colors duration-300 focus-visible:outline-0 focus-visible:ring-2 disabled:pointer-events-none disabled:text-contrast-300"
            disabled={!canScrollNext}
            onClick={scrollNext}
            role="button"
          >
            <ArrowRight strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Carousel;
