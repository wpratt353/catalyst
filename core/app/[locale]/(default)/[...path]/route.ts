// Catch-all route

import { notFound, permanentRedirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getSessionCustomerId } from '~/auth';
import { getChannelIdFromLocale } from '~/channels.config';
import { getRawWebPageContent } from '~/client/queries/get-raw-web-page-content';
import { getRoute } from '~/client/queries/get-route';
import { getStoreStatus } from '~/client/queries/get-store-status';
import { defaultLocale } from '~/i18n';
import { clearLocaleFromPath } from '~/lib/clearLocaleFromPath';

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

export const GET = async (request: NextRequest) => {
  const locale = request.cookies.get('NEXT_LOCALE')?.value || defaultLocale;

  const { route, status } = await getRouteInfo(request, locale);

  if (status === 'MAINTENANCE') {
    return fetch(new URL(`/${locale}/maintenance`, request.url), { next: { revalidate: 300 } });
  }

  const customerId = await getSessionCustomerId();
  const postfix = '';

  // if (!request.nextUrl.search && !customerId && request.method === 'GET') {
  //   postfix = '/static';
  // }

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

  console.log('request.nextUrl', request.nextUrl.toString());

  const url = new URL(request.nextUrl.toString());

  switch (node?.__typename) {
    case 'Brand': {
      url.pathname = `/catalyst/${locale}/brand/${node.entityId}`;
      break;
    }

    case 'Category': {
      url.pathname = `/catalyst/${locale}/category/${node.entityId}`;
      break;
    }

    case 'Product': {
      url.pathname = `/catalyst/${locale}/product/${node.entityId}`;
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
      // todo fix 404 page render
      notFound();
    }
  }

  const clonedReq = new NextRequest(request, { ...request, next: { revalidate: 3600 } });

  // remove accept-encoding header to prevent double gzip compression
  clonedReq.headers.delete('accept-encoding');
  clonedReq.headers.delete('x-middleware-rewrite');
  clonedReq.headers.set('x-bc-bypass-middleware', 'true');

  console.log('url right before fetch', url.toString());

  const response = await fetch(url, clonedReq);

  // remove content-encoding header to prevent double gzip compression
  // clone the request to avoid mutating the original request
  const clonedResponse = new Response(response.body, response);

  // clonedResponse.headers.set('Cache-Control', 'max-age=10');
  // clonedResponse.headers.set('CDN-Cache-Control', 'max-age=60');
  // clonedResponse.headers.set('Vercel-CDN-Cache-Control', 'max-age=3600');

  clonedResponse.headers.delete('x-middleware-rewrite');
  clonedResponse.headers.delete('content-encoding');
  clonedResponse.headers.delete('content-length');
  clonedResponse.headers.delete('transfer-encoding');

  return clonedResponse;
};
