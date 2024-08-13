// import { NextResponse } from 'next/server';

import { composeMiddlewares, MiddlewareFactory } from './middlewares/compose-middlewares';
import { withAuth } from './middlewares/with-auth';
import { withIntl } from './middlewares/with-intl';

export const withDeini: MiddlewareFactory = (next) => {
  return async (request, event) => {
    console.log('=============');
    console.log('Middleware run attempt');
    console.log('URL:', request.url);
    console.log('x-bc-bypass-middleware header:', request.headers.get('x-bc-bypass-middleware'));

    // const url = new URL(request.url);
    // const parts = url.pathname.split('/').filter(Boolean);

    // // Clone the request and add the query parameter
    // const url = new URL(request.url);

    // url.searchParams.set('static', 'true');

    // // Create a new request with the modified URL
    // const newRequest = new NextRequest(url, request);

    // return next(newRequest, event);

    // // return next(request, event);
    // //     // Check if the user is logged in (you'll need to implement this logic)

    // If the user is logged in or it's the home page, continue with the regular middleware chain
    const response = await next(request, event);

    if (response) {
      // Add x-bc-bypass-middleware header to the response
      response.headers.append('x-bc-bypass-middleware', 'true');
    }

    return response;
  };
};

export const middleware = composeMiddlewares(withAuth, withDeini, withIntl);

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
