// Catch-all route - Static

import { permanentRedirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getChannelIdFromLocale } from '~/channels.config';
import { getRawWebPageContent } from '~/client/queries/get-raw-web-page-content';
import { getRoute } from '~/client/queries/get-route';
import { getStoreStatus } from '~/client/queries/get-store-status';
import { defaultLocale, localePrefix, LocalePrefixes } from '~/i18n';

export const dynamic = 'force-static';

const StorefrontStatusSchema = z.union([
  z.literal('HIBERNATION'),
  z.literal('LAUNCHED'),
  z.literal('MAINTENANCE'),
  z.literal('PRE_LAUNCH'),
]);

const RedirectSchema = z.object({
  __typename: z.string(),
  to: z.object({
    __typename: z.string(),
  }),
  toUrl: z.string(),
});

const NodeSchema = z.union([
  z.object({ __typename: z.literal('Product'), entityId: z.number() }),
  z.object({ __typename: z.literal('Category'), entityId: z.number() }),
  z.object({ __typename: z.literal('Brand'), entityId: z.number() }),
  z.object({ __typename: z.literal('ContactPage'), id: z.string() }),
  z.object({ __typename: z.literal('NormalPage'), id: z.string() }),
  z.object({ __typename: z.literal('RawHtmlPage'), id: z.string() }),
]);

const RouteSchema = z.object({
  redirect: z.nullable(RedirectSchema),
  node: z.nullable(NodeSchema),
});

const clearLocaleFromPath = (path: string, locale?: string) => {
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

const getRouteInfo = async (request: NextRequest, locale?: string) => {
  try {
    const channelId = getChannelIdFromLocale(locale);
    const pathname = clearLocaleFromPath(request.nextUrl.pathname, locale);

    const [route, status] = await Promise.all([
      getRoute(pathname, channelId),
      getStoreStatus(channelId),
    ]);

    const parsedRoute = RouteSchema.safeParse(route);
    const parsedStatus = StorefrontStatusSchema.safeParse(status);

    return {
      route: parsedRoute.success ? parsedRoute.data : undefined,
      status: parsedStatus.success ? parsedStatus.data : undefined,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    return {
      route: undefined,
      status: undefined,
    };
  }
};

export const GET = async (request: NextRequest, { params }: { params: { locale: string } }) => {
  console.log('===== STATIC CATCH ALL ROUTE');

  await new Promise((resolve) => setTimeout(resolve, 300));

  // const locale = request.cookies.get('NEXT_LOCALE')?.value || '';
  const locale = params.locale;

  const { route, status } = await getRouteInfo(request, locale);

  if (status === 'MAINTENANCE') {
    return fetch(new URL(`/${locale}/maintenance`, request.url), { next: { revalidate: 300 } });
  }

  const postfix = '/static';

  if (route?.redirect) {
    switch (route.redirect.to.__typename) {
      case 'ManualRedirect': {
        // For manual redirects, redirect to the full URL to handle cases
        // where the destination URL might be external to the site
        return permanentRedirect(route.redirect.toUrl);
      }

      default: {
        // For all other cases, assume an internal redirect and construct the URL
        // based on the current request URL to maintain internal redirection
        // in non-production environments
        const redirectPathname = new URL(route.redirect.toUrl).pathname;
        const redirectUrl = new URL(redirectPathname, request.url);

        return permanentRedirect(redirectUrl.toString());
      }
    }
  }

  const node = route?.node;
  const url = request.nextUrl.clone();

  switch (node?.__typename) {
    case 'Brand': {
      url.pathname = `/${locale}/brand/${node.entityId}${postfix}`;
      break;
    }

    case 'Category': {
      url.pathname = `/${locale}/category/${node.entityId}${postfix}`;
      break;
    }

    case 'Product': {
      url.pathname = `/${locale}/product/${node.entityId}${postfix}`;
      break;
    }

    case 'NormalPage': {
      url.pathname = `/${locale}/webpages/normal/${node.id}`;
      break;
    }

    case 'ContactPage': {
      url.pathname = `/${locale}/webpages/contact/${node.id}`;
      break;
    }

    case 'RawHtmlPage': {
      const { htmlBody } = await getRawWebPageContent(node.id);

      return new NextResponse(htmlBody, {
        headers: { 'content-type': 'text/html' },
      });
    }

    default: {
      const { pathname } = new URL(request.url);
      const cleanPathName = clearLocaleFromPath(pathname);

      if (cleanPathName === '/') {
        url.pathname = `/${locale}${postfix}`;
        break;
      }

      url.pathname = `/${locale}${cleanPathName}`;
    }
  }

  console.log('=== URL', url.toString());

  const newUrl = new URL(url);

  if (process.env.VERCEL_URL) {
    newUrl.host = process.env.VERCEL_URL;
    newUrl.port = '443';
  }

  console.log('=== URL after shim', url.toString());

  const response = await fetch(newUrl, {
    headers: {
      'x-bc-bypass-middleware': 'true',
    },
  });

  const newResponse = new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      'content-type': response.headers.get('content-type') || 'text/html',
      'cache-control': 'public, max-age=3600',
      'x-bc-bypass-middleware': 'true',
    },
  });

  newResponse.headers.delete('content-encoding');
  newResponse.headers.delete('content-length');
  newResponse.headers.delete('transfer-encoding');
  newResponse.headers.delete('x-middleware-rewrite');

  return newResponse;

  // const headers = new Headers(request.headers);

  // headers.append('x-bc-bypass-middleware', 'true');

  // const clonedReq = new NextRequest(request, {
  //   ...request,
  //   next: { revalidate: 3600 },
  //   headers,
  // });

  // // remove accept-encoding header to prevent double gzip compression
  // // clonedReq.headers.delete('accept-encoding');
  // // clonedReq.headers.delete('x-middleware-rewrite');

  // const response = await fetch(url, clonedReq);

  // // clone the request to avoid mutating the original request
  // const clonedResponse = new Response(response.body, response);

  // console.log('========================== HEADERS:');
  // console.log(clonedResponse.headers);

  // console.log('+++++++++++++++++++++++++++++ HEADERS:');
  // console.log(request.headers);

  // // remove content-encoding header to prevent double gzip compression
  // clonedResponse.headers.delete('content-encoding');
  // clonedResponse.headers.delete('content-length');
  // clonedResponse.headers.delete('transfer-encoding');
  // clonedResponse.headers.delete('x-middleware-rewrite');

  // clonedResponse.headers.append('x-bc-bypass-middleware', 'true');

  // return clonedResponse;
};
