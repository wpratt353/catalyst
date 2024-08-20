import { Link as LinkControl, Select, Style, TextInput } from '@makeswift/runtime/controls';

import { Link } from '~/components/link';
import { Button } from '~/components/ui/button';
import { runtime } from '~/lib/makeswift/runtime';

interface Props {
  variant: 'primary' | 'secondary' | 'tertiary';
  size: 'default' | 'small';
  label: string;
  className: string;
  link?: {
    href: string;
    target?: '_blank' | '_self';
  };
}

runtime.registerComponent(
  function MakeswiftButton({ variant, size, className, label, link }: Props) {
    return (
      <Button asChild className={className} size={size} variant={variant}>
        <Link href={link ? link.href : '#'} target={link ? link.target : ''}>
          {label}
        </Link>
      </Button>
    );
  },
  {
    type: 'catalyst-button',
    label: 'Catalyst / Button',
    props: {
      className: Style({ properties: [Style.Margin] }),
      label: TextInput({ label: 'Label', defaultValue: 'Button' }),
      variant: Select({
        label: 'Variant',
        options: [
          { value: 'primary', label: 'Primary' },
          { value: 'secondary', label: 'Secondary' },
          { value: 'tertiary', label: 'Tertiary' },
        ],
        defaultValue: 'primary',
      }),
      size: Select({
        label: 'Size',
        options: [
          { value: 'default', label: 'Default' },
          { value: 'small', label: 'Small' },
        ],
        defaultValue: 'default',
      }),
      link: LinkControl(),
    },
  },
);
