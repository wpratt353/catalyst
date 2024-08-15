import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { boolean } from 'zod';

import { getSessionCustomerId } from '~/auth';
import { clearLocaleFromPath } from '~/lib/clearLocaleFromPath';

import { defaultLocale, localePrefix, locales } from '../i18n';

import { type MiddlewareFactory } from './compose-middlewares';

let locale: string;

export const withIntl: MiddlewareFactory = () => {
  return async (request) => {
    locale = cookies().get('NEXT_LOCALE')?.value || '';

    const intlMiddleware = createMiddleware({
      locales,
      localePrefix,
      defaultLocale,
      localeDetection: true,
    });

    const response = intlMiddleware(request);

    // Early redirect to detected locale if needed
    if (response.redirected) {
      return response;
    }

    if (!locale) {
      // Try to get locale detected by next-intl
      locale = response.cookies.get('NEXT_LOCALE')?.value || '';
    }

    const customerId = await getSessionCustomerId();

    const rewriteUrl = new URL(request.url);

    console.log('request.nextUrl.search', request.nextUrl.search, !request.nextUrl.search);
    console.log('customerId', customerId, !customerId);
    console.log('request.method', request.method, request.method === 'GET');

    const isHomePage = clearLocaleFromPath(request.nextUrl.pathname) === '/'; // todo handle trailing slash config

    const exemptedRoutes = ['/_catalyst', '/search', '/cart'];

    // todo exempt internal routes from going to the catch-all route
    if (
      !request.nextUrl.search && // does not have query params
      !customerId && // customer is not logged in
      request.method === 'GET' && // is a GET request
      !exemptedRoutes.some(
        // is not an exempted route
        (route) => request.nextUrl.pathname.startsWith(route),
      )
    ) {
      console.log(`Redirecting to static path for ${request.nextUrl.pathname}`);

      if (isHomePage) {
        rewriteUrl.pathname = `/catalyst/${locale}/staticHome/`;
        console.log('rewriteUrl.pathname', rewriteUrl.pathname);

        // rewrite immediately for home page to avoid infinite loop
        return NextResponse.rewrite(rewriteUrl);
      }

      rewriteUrl.pathname = `/_catalyst/static${request.nextUrl.pathname}`;
    } else if (isHomePage) {
      // todo handle trailing slash config
      console.log('Return dynamic path for home page');

      return response;
    }

    const rewrite = NextResponse.rewrite(rewriteUrl);

    // Add rewrite header to response provided by next-intl
    rewrite.headers.forEach((v, k) => response.headers.set(k, v));

    return response;
  };
};
