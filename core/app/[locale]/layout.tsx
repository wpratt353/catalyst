import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { unstable_setRequestLocale } from 'next-intl/server';
import { PropsWithChildren } from 'react';

import '../globals.css';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

import { Notifications } from '../notifications';
import { Providers } from '../providers';

const inter_heading = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-family-heading',
});

const inter_body = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-family-body',
});

const roboto_mono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-family-mono',
});

const RootLayoutMetadataQuery = graphql(`
  query RootLayoutMetadataQuery {
    site {
      settings {
        storeName
        seo {
          pageTitle
          metaDescription
          metaKeywords
        }
      }
    }
  }
`);

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await client.fetch({
    document: RootLayoutMetadataQuery,
    fetchOptions: { next: { revalidate } },
  });

  const storeName = data.site.settings?.storeName ?? '';

  const { pageTitle, metaDescription, metaKeywords } = data.site.settings?.seo || {};

  return {
    title: {
      template: `%s - ${storeName}`,
      default: pageTitle || storeName,
    },
    description: metaDescription,
    keywords: metaKeywords ? metaKeywords.split(',') : null,
    other: {
      platform: 'bigcommerce.catalyst',
      build_sha: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? '',
    },
  };
}

export const fetchCache = 'default-cache';

interface RootLayoutProps extends PropsWithChildren {
  params: { locale: string };
}

export default function RootLayout({ children, params: { locale } }: RootLayoutProps) {
  // need to call this method everywhere where static rendering is enabled
  // https://next-intl-docs.vercel.app/docs/getting-started/app-router#add-unstable_setrequestlocale-to-all-layouts-and-pages
  unstable_setRequestLocale(locale);

  const messages = useMessages();

  return (
    <html
      className={`${inter_heading.variable} ${inter_body.variable} ${roboto_mono.variable}`}
      lang={locale}
    >
      <body className="flex h-screen min-w-[375px] flex-col">
        <Notifications />
        <NextIntlClientProvider locale={locale} messages={{ Providers: messages.Providers ?? {} }}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
