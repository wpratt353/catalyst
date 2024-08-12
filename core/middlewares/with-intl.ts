import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { getSessionCustomerId } from '~/auth';

import { defaultLocale, localePrefix, locales } from '../i18n';

import { type MiddlewareFactory } from './compose-middlewares';

export const withIntl: MiddlewareFactory = () => {
  return async (request) => {
    const customerId = await getSessionCustomerId();

    if (!request.nextUrl.search && !customerId && request.method === 'GET') {
      return NextResponse.rewrite(
        new URL(`/_catalyst/static/${request.nextUrl.pathname}`, request.url),
      );
    }

    const intlMiddleware = createMiddleware({
      locales,
      localePrefix,
      defaultLocale,
      localeDetection: true,
    });

    return intlMiddleware(request);
  };
};
