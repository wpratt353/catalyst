import Image from 'next/image';

import { Link as CustomLink } from '~/components/link';

import Button from '../button';

interface Props {
  title: string;
  description: string;
  image: {
    src: string;
    blurDataUrl?: string;
    altText: string;
  };
  cta: {
    href: string;
    label: string;
  };
}

export const FeaturedImage = function FeaturedImage({ title, description, image, cta }: Props) {
  return (
    <section className="relative h-[100dvh] max-h-[880px] bg-primary-shadow @container">
      <div className="mx-auto flex h-full max-w-screen-2xl flex-col @3xl:flex-row">
        <div className="relative h-full w-full @3xl:w-1/2 @5xl:w-3/5">
          <Image
            alt={image.altText}
            blurDataURL={image.blurDataUrl}
            className="object-cover"
            fill
            placeholder={image.blurDataUrl ? 'blur' : 'empty'}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 60vw"
            src={image.src}
          />
        </div>
        <div className="z-10 flex w-full flex-col items-start justify-end gap-4 px-3 py-10 text-background @xl:px-6 @3xl:w-1/2 @5xl:w-2/5 @5xl:p-20">
          <h2 className="max-w-xl font-heading text-[40px] font-medium leading-none">{title}</h2>
          <p className="max-w-xl pb-2">{description}</p>
          <Button asChild>
            <CustomLink href={cta.href}>{cta.label}</CustomLink>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedImage;
