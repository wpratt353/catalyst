import clsx from 'clsx';
import Image from 'next/image';

import InlineEmailForm from '../inline-email-form';

interface Props {
  image?: {
    src: string;
    altText: string;
  };
  title: string;
  description: string;
}

export const Subscribe = function Subscribe({ image, title, description }: Props) {
  return (
    <section className="@container">
      <div className="mx-auto flex max-w-screen-2xl flex-col items-center @2xl:flex-row">
        {image && (
          <div className="relative aspect-square h-full w-full overflow-hidden bg-primary/10 @2xl:aspect-[9/12] @2xl:w-3/4 @4xl:aspect-square">
            <Image
              alt={image.altText}
              className="object-cover"
              fill
              sizes="(max-width: 680px) 100vw, 50vw"
              src={image.src}
            />
          </div>
        )}

        <div
          className={clsx(
            'text-foreground flex w-full items-center gap-y-12 px-3 @xl:px-6 @5xl:px-20',
            !image ? 'flex-col gap-x-10 py-20 @2xl:flex-row' : 'flex-col py-10 @3xl:gap-y-16',
          )}
        >
          <div className="w-full">
            <h2 className="font-heading mb-4 text-4xl font-medium leading-none @2xl:max-w-lg @7xl:text-5xl">
              {title}
            </h2>
            <p className="opacity-50 @2xl:max-w-sm">{description}</p>
          </div>

          <InlineEmailForm />
        </div>
      </div>
    </section>
  );
};

export default Subscribe;
