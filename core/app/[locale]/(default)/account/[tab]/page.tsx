import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { getCustomerAddresses } from '~/client/queries/get-customer-addresses';
import { LocaleType } from '~/i18n';

import { AddressesContent } from './_components/addresses-content';
import { CustomerEditAddress } from './_components/customer-edit-address';
import { CustomerNewAddress } from './_components/customer-new-address';
import { SettingsContent } from './_components/settings-content';
import { TabHeading } from './_components/tab-heading';
import { TabType } from './layout';

interface Props {
  params: {
    locale: LocaleType;
    tab: TabType;
  };
  searchParams: {
    [key: string]: string | string[] | undefined;
    before?: string;
    after?: string;
  };
}

export async function generateMetadata({ params: { tab, locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Account.Home' });

  return {
    title: t(tab === 'recently-viewed' ? 'recentlyViewed' : tab),
  };
}

export default async function AccountTabPage({ params: { tab, locale }, searchParams }: Props) {
  const t = await getTranslations({ locale, namespace: 'Account.Home' });

  switch (tab) {
    case 'orders':
      return <TabHeading heading={tab} locale={locale} />;

    case 'messages':
      return <TabHeading heading={tab} locale={locale} />;

    case 'addresses': {
      const { before, after, action } = searchParams;

      if (action === 'add-new-address') {
        return (
          <div className="mx-auto mb-14 lg:w-2/3">
            <h1 className="my-8 text-3xl font-black lg:text-4xl">{t('newAddress')}</h1>
            <CustomerNewAddress />
          </div>
        );
      }

      const customerAddressesDetails = await getCustomerAddresses({
        ...(after && { after }),
        ...(before && { before }),
        limit: action === 'edit-address' ? undefined : 2,
      });

      if (!customerAddressesDetails) {
        notFound();
      }

      const { addresses, pageInfo, addressesCount } = customerAddressesDetails;

      if (action === 'edit-address' && searchParams['address-id']) {
        const activeAddress = addresses
          .filter(({ entityId }) => entityId.toString() === searchParams['address-id'])
          .shift();

        return (
          <div className="mx-auto mb-14 lg:w-2/3">
            <h1 className="my-8 text-3xl font-black lg:text-4xl">{t('updateAddress')}</h1>
            {activeAddress && Object.keys(activeAddress).length > 0 ? (
              <CustomerEditAddress address={activeAddress} />
            ) : null}
          </div>
        );
      }

      return (
        <AddressesContent
          addresses={addresses}
          addressesCount={addressesCount}
          pageInfo={pageInfo}
          title={tab}
        />
      );
    }

    case 'wishlists':
      return <TabHeading heading={tab} locale={locale} />;

    case 'recently-viewed':
      return <TabHeading heading={tab} locale={locale} />;

    case 'settings': {
      return <SettingsContent action={searchParams.action} title={tab} />;
    }

    default:
      return notFound();
  }
}

export const runtime = 'edge';
