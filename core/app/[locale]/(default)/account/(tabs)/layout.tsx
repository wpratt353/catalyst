import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { PropsWithChildren } from 'react';

import { Link } from '~/components/link';
import { LocaleType } from '~/i18n';
import { cn } from '~/lib/utils';

import { AccountStatusProvider } from './_components/account-status-provider';

const tabList = ['addresses', 'settings', 'orders'] as const;

export type TabType = (typeof tabList)[number];

interface Props extends PropsWithChildren {
  params: { locale: LocaleType; tab?: TabType };
}

export default async function AccountTabLayout({ children, params: { locale } }: Props) {
  unstable_setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'Account.Home' });

  const messages = await getMessages();

  const tabsTitles = {
    addresses: t('addresses'),
    settings: t('settings'),
    orders: t('orders'),
  };

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={{ Account: messages.Account ?? {}, Product: messages.Product ?? {} }}
    >
      <AccountStatusProvider>
        <h1 className="my-8 text-4xl font-black lg:my-8 lg:text-5xl">{t('heading')}</h1>
        <nav aria-label={t('accountTabsLabel')}>
          <ul className="mb-8 flex items-start overflow-x-auto">
            {tabList.map((tab) => (
              <li key={tab}>
                <Link
                  className={cn('block whitespace-nowrap px-4 pb-2 font-semibold')}
                  href={`/account/${tab}`}
                  prefetch="viewport"
                  prefetchKind="full"
                >
                  {tabsTitles[tab]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {children}
      </AccountStatusProvider>
    </NextIntlClientProvider>
  );
}
