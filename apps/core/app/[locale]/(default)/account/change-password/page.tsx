import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';

import { LocaleType } from '~/i18n';

import { ChangePasswordForm } from './_components/change-password-form';

interface Props {
  params: {
    locale: LocaleType;
  };
}

export default async function ChangePasswordPage({ params: { locale } }: Props) {
  const messages = await getMessages({ locale });
  const t = await getTranslations({ locale, namespace: 'Account.Home' });

  return (
    <div className="mx-auto max-w-screen-xl">
      <h1 className="my-6 my-8 text-4xl font-black lg:my-8 lg:text-5xl">{t('changePassword')}</h1>
      <NextIntlClientProvider locale={locale} messages={{ Account: messages.Account ?? {} }}>
        <ChangePasswordForm />
      </NextIntlClientProvider>
    </div>
  );
}
