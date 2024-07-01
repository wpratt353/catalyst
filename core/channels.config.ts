import { locales } from './i18n';

export type LocalesKeys = (typeof locales)[number];

export type RecordFromLocales = {
  [K in LocalesKeys]: string;
};

// Set overrides per locale
const localeToChannelsMappings: Partial<RecordFromLocales> = {
  // es: '123456',
};

export function getChannelIdFromLocale(locale?: string) {
  if (!process.env.BIGCOMMERCE_CHANNEL_ID) {
    throw new Error('Client configuration must include a channelId.');
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return localeToChannelsMappings[locale as LocalesKeys] || process.env.BIGCOMMERCE_CHANNEL_ID;
}

export default localeToChannelsMappings;
