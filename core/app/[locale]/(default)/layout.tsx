import { unstable_setRequestLocale } from 'next-intl/server';
import { PropsWithChildren } from 'react';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { Footer, FooterFragment } from '~/components/footer';
import { Header, HeaderFragment } from '~/components/header';
import { LocaleType } from '~/i18n';

interface Props extends PropsWithChildren {
  params: { locale: LocaleType };
}

const LayoutQuery = graphql(
  `
    query LayoutQuery {
      site {
        ...HeaderFragment
        ...FooterFragment
      }
    }
  `,
  [HeaderFragment, FooterFragment],
);

export default async function DefaultLayout({ children, params: { locale } }: Props) {
  unstable_setRequestLocale(locale);

  const customerId = await getSessionCustomerId();

  const { data } = await client.fetch({
    document: LayoutQuery,
    fetchOptions: customerId ? { cache: 'no-store' } : { next: { revalidate } },
  });

  return (
    <>
      <Header data={data.site} />

      <main>{children}</main>

      <Footer data={data.site} />
    </>
  );
}
