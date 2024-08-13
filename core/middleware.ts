import { NextRequest, NextResponse } from 'next/server';

import { getSessionCustomerId } from './auth';
import { composeMiddlewares, MiddlewareFactory } from './middlewares/compose-middlewares';
import { withAuth } from './middlewares/with-auth';
import { withIntl } from './middlewares/with-intl';

const alwaysDynamic = ['/login', '/account'];

export const withLogs: MiddlewareFactory = (next) => {
  return async (request, event) => {
    console.log('=========== withLogs');

    const customerId = await getSessionCustomerId();

    // If customer is logged in or it's already a static route, proceed with regular catch-all
    if (customerId) {
      console.log('=========== withLogs: customer logged in', customerId);

      return next(request, event);
    }

    if (request.nextUrl.pathname.includes('/static')) {
      console.log(request.nextUrl.pathname);
      console.log('=========== withLogs: lets go with static because /static already there');

      return next(request, event);
    }

    // if pathname is partially one of alwaysDynamic, proceed with regular catch-all
    if (alwaysDynamic.some((path) => request.nextUrl.pathname.includes(path))) {
      console.log('=========== withLogs: alwaysDynamic');

      return next(request, event);
    }

    console.log('=========== withLogs: lets go with static');

    // For non-logged-in users, rewrite to static route
    const url = request.nextUrl.clone();

    console.log('=========== withLogs: url', url.toString());

    url.pathname = `/static/${url.pathname}`.replace(/\/+/g, '/');

    // Create a new request with the modified URL
    // const newRequest = new NextRequest(new Request(url, request), {
    const newRequest = new NextRequest(new Request(url, request), request);

    console.log('===== After new request');

    return next(newRequest, event);
  };
};

export const middleware = composeMiddlewares(withAuth, withLogs, withIntl);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _vercel (vercel internals, eg: web vitals)
     * - favicon.ico (favicon file)
     * - admin (admin panel)
     * - sitemap.xml (sitemap route)
     * - xmlsitemap.php (legacy sitemap route)
     * - robots.txt (robots route)
     */
    {
      source:
        '/((?!api|admin|_next/static|_next/image|_vercel|favicon.ico|xmlsitemap.php|sitemap.xml|robots.txt).*)',
      missing: [{ type: 'header', key: 'x-bc-bypass-middleware' }],
    },
  ],
};

/* TODO: deini
  - /login que funcione
*/
