import { Shape, Style, TextInput } from '@makeswift/runtime/controls';
import { ComponentProps } from 'react';

import { FeaturedImage } from '~/components/ui/featured-image';
import { runtime } from '~/lib/makeswift/runtime';

runtime.registerComponent(
  function MakeswiftFeaturedImage({
    cta,
    description,
    image,
    title,
    className,
  }: ComponentProps<typeof FeaturedImage> & { className: string }) {
    return (
      <div className={className}>
        <FeaturedImage cta={cta} description={description} image={image} title={title} />
      </div>
    );
  },
  {
    type: 'catalyst-featured-image',
    label: 'Catalyst / Featured Image',
    props: {
      className: Style(),
      title: TextInput({ label: 'Title', defaultValue: 'Title' }),
      description: TextInput({ label: 'Description', defaultValue: 'Description' }),
      image: Shape({
        type: {
          src: TextInput({ label: 'Image URL', defaultValue: '' }),
          altText: TextInput({ label: 'Alt text', defaultValue: 'Default alt text' }),
        },
      }),
      cta: Shape({
        type: {
          label: TextInput({ label: 'Label', defaultValue: 'Shop now' }),
          href: TextInput({ label: 'Link', defaultValue: '/#' }),
        },
      }),
    },
  },
);
