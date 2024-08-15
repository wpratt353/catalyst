import { List, Shape, Style, TextInput } from '@makeswift/runtime/controls';
import { ComponentProps } from 'react';

import { Slideshow } from '~/components/ui/slideshow';
import { runtime } from '~/lib/makeswift/runtime';

runtime.registerComponent(
  function MakeswiftSlideshow({ className, slides }: ComponentProps<typeof Slideshow>) {
    return <Slideshow className={className} slides={slides} />;
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
            image: Shape({
              type: {
                src: TextInput({ label: 'Image URL', defaultValue: '' }),
                altText: TextInput({ label: 'Alt text', defaultValue: '' }),
                blurDataUrl: TextInput({ label: 'Blur data URL' }),
              },
            }),
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
