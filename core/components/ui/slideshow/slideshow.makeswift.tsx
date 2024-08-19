import { Image, List, Shape, Style, TextInput } from '@makeswift/runtime/controls';

import { Slideshow } from '~/components/ui/slideshow';
import { runtime } from '~/lib/makeswift/runtime';

interface Props {
  className?: string;
  slides: Array<{
    title: string;
    description?: string;
    image?: string;
    imageAlt: string;
    cta: {
      label: string;
      href: string;
    };
  }>;
}

runtime.registerComponent(
  function MakeswiftSlideshow({ className, slides }: Props) {
    const transformedSlides = slides.map((slide) => ({
      title: slide.title,
      description: slide.description,
      image: {
        src: slide.image ?? '',
        altText: slide.imageAlt,
      },
      cta: {
        label: slide.cta.label,
        href: slide.cta.href,
      },
    }));

    return <Slideshow className={className} slides={transformedSlides} />;
  },
  {
    type: 'catalyst-slideshow',
    label: 'Catalyst / Slideshow',
    props: {
      className: Style(),
      slides: List({
        label: 'Slides',
        type: Shape({
          type: {
            title: TextInput({ label: 'Title', defaultValue: '' }),
            description: TextInput({ label: 'Description' }),
            image: Image({
              label: 'Background image',
              format: Image.Format.URL,
            }),
            imageAlt: TextInput({ label: 'Image alt text', defaultValue: '' }),
            cta: Shape({
              type: {
                label: TextInput({ label: 'Label', defaultValue: 'Shop now' }),
                href: TextInput({ label: 'Link', defaultValue: '/#' }),
              },
            }),
          },
        }),
        getItemLabel(item) {
          return item?.title ?? 'Slide';
        },
      }),
    },
  },
);
