import createMiddleware from 'next-intl/middleware';

import { defaultLocale, localePrefix, locales } from '../i18n';

import { type MiddlewareFactory } from './compose-middlewares';
import { getSessionCustomerId } from '~/auth';
import { NextResponse } from 'next/server';
import { boolean } from 'zod';

export const withIntl: MiddlewareFactory = () => {
  return async (request) => {
    const customerId = await getSessionCustomerId();

    console.log('request.nextUrl.search',request.nextUrl.search, !request.nextUrl.search)
    console.log('customerId', customerId, !customerId)
    console.log('request.method', request.method, request.method === 'GET')

    if (!request.nextUrl.search && !customerId && request.method === 'GET' && !request.nextUrl.pathname.startsWith('/_catalyst')) {
      console.log(`Redirecting to static path for ${request.nextUrl.pathname}`);
      return NextResponse.rewrite(new URL(`/_catalyst/static${request.nextUrl.pathname}`, request.url));
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
