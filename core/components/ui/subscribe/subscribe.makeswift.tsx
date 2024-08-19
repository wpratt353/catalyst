import { Style, TextInput } from '@makeswift/runtime/controls';

import { Subscribe } from '~/components/ui/subscribe';
import { runtime } from '~/lib/makeswift/runtime';

runtime.registerComponent(
  function MakeswiftSubscribeBasic({
    title,
    description,
    className,
  }: {
    title: string;
    description: string;
    className: string;
  }) {
    return (
      <div className={className}>
        <Subscribe description={description} title={title} />
      </div>
    );
  },
  {
    type: 'catalyst-subscribe-basic',
    label: 'Catalyst / Subscribe',
    props: {
      className: Style(),
      title: TextInput({ label: 'Title', defaultValue: '' }),
      description: TextInput({ label: 'Description', defaultValue: '' }),
    },
  },
);
