import { getStoreSettings } from '~/client/queries/get-store-settings';
import { BcImage } from '~/components/bcImage';

export const StoreLogo = async () => {
  const settings = await getStoreSettings();

  if (!settings) {
    return null;
  }

  const { logoV2: logo, storeName } = settings;

  if (logo.__typename === 'StoreTextLogo') {
    return <span className="text-2xl font-black">{logo.text}</span>;
  }

  return (
    <BcImage
      alt={logo.image.altText ? logo.image.altText : storeName}
      className="max-h-16 object-contain"
      height={32}
      priority
      src={logo.image.url}
      width={155}
    />
  );
};
