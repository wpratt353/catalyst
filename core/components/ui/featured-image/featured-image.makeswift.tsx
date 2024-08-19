import { Image, Shape, Style, TextInput } from '@makeswift/runtime/controls';

import { FeaturedImage } from '~/components/ui/featured-image';
import { runtime } from '~/lib/makeswift/runtime';

interface Props {
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  className: string;
  cta?: {
    href: string;
    label: string;
  };
}

runtime.registerComponent(
  function MakeswiftFeaturedImage({ cta, description, image, imageAlt, title, className }: Props) {
    const imageFromMakeswiftProps = {
      src: image ?? '',
      altText: imageAlt ?? '',
    };

    return (
      <div className={className}>
        <FeaturedImage
          cta={cta}
          description={description}
          image={imageFromMakeswiftProps}
          title={title}
        />
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
      image: Image({
        label: 'Image',
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
  },
);
