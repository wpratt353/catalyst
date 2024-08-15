import proxiedRootLayout, { generateMetadata, generateStaticParams } from '../../[locale]/layout';
import { PropsWithChildren } from 'react';

export { generateMetadata, generateStaticParams };

interface RootLayoutProps extends PropsWithChildren {
    params: { locale: string };
}

export default function RootLayout({ children, params: { locale } }: RootLayoutProps) {
    return proxiedRootLayout({ children, params: { locale } })
}
