'use client';

import clsx from 'clsx';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import Button from '../button';

import ProgressSection from './progress-section';

interface Link {
  label: string;
  href: string;
}

interface Image {
  altText: string;
  blurDataUrl?: string;
  src: string;
}

export interface Slide {
  title: string;
  description?: string;
  image?: Image;
  cta?: Link;
}

interface Props {
  className?: string;
  slides: Slide[];
}

export const Slideshow = function Slideshow({ slides, className = '' }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const nextIndex = (currentIndex + 1) % slides.length;

      setCurrentIndex(nextIndex);
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentIndex, slides.length, setCurrentIndex]);

  return (
    <header
      className={clsx('bg-primary-shadow relative h-[100dvh] max-h-[880px] @container', className)}
    >
      {slides.map(({ title, description, image, cta }, idx) => {
        return (
          <div
            className={clsx(
              'absolute inset-0 transition-opacity duration-1000 ease-in-out',
              currentIndex === idx ? 'opacity-100' : 'opacity-0',
            )}
            key={idx}
          >
            <div className="text-background absolute bottom-0 left-1/2 z-10 w-full max-w-screen-2xl -translate-x-1/2 px-3 @xl:px-6 @5xl:px-20">
              <h1 className="font-heading mb-1 text-5xl font-medium leading-none @2xl:text-[90px]">
                {title}
              </h1>
              {description && <p className="max-w-xl">{description}</p>}
              {cta?.href && (
                <Button className="mt-4" variant="tertiary">
                  {cta.label}
                </Button>
              )}

              <ProgressSection
                className="z-10 w-full pb-2 pt-4 @lg:pb-8 @lg:pt-10"
                currentIndex={currentIndex}
                setCurrentIndex={setCurrentIndex}
                slides={slides}
              />
            </div>

            {/* TODO: Implement progressive loading with blurDataUrl */}
            {image?.src && (
              <Image
                alt={image.altText}
                blurDataURL={image.blurDataUrl}
                className="object-cover"
                fill
                placeholder={image.blurDataUrl ? 'blur' : 'empty'}
                priority
                sizes="100vw"
                src={image.src}
              />
            )}
          </div>
        );
      })}
    </header>
  );
};

export default Slideshow;
