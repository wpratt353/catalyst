import { defaultLocale, localePrefix, LocalePrefixes } from '../i18n';

export const clearLocaleFromPath = (path: string, locale?: string) => {
  // todo handle trailing slash config
  let res: string;

  if (localePrefix === LocalePrefixes.ALWAYS) {
    res = locale ? `/${path.split('/').slice(2).join('/')}` : path;

    return res;
  }

  if (localePrefix === LocalePrefixes.ASNEEDED) {
    res = locale && locale !== defaultLocale ? `/${path.split('/').slice(2).join('/')}` : path;

    return res;
  }

  return path;
};
