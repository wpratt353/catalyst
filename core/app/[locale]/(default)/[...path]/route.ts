import { cookies } from 'next/headers';
import { permanentRedirect } from 'next/navigation';
import { NextRequest } from 'next/server';

import { getSessionCustomerId } from '~/auth';
import { getChannelIdFromLocale } from '~/channels.config';
import { getRawWebPageContent } from '~/client/queries/get-raw-web-page-content';
import { getRoute } from '~/client/queries/get-route';
import { getStoreStatus } from '~/client/queries/get-store-status';
import { defaultLocale, localePrefix, LocalePrefixes, locales } from '~/i18n';

// Follow redirects if found on the route
// Use 301 status code as it is more universally supported by crawlers
const redirectConfig = { status: 301 };

let locale: string;

const clearLocaleFromPath = (path: string) => {
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

export async function GET(req: NextRequest) {
  const path = req.nextUrl.pathname;

  locale = cookies().get('NEXT_LOCALE')?.value || '';

  const channelId = getChannelIdFromLocale(locale);

  console.log('path', path);
  console.log('locale', locale);
  console.log('channelId', channelId);

  const [route, status] = await Promise.all([getRoute(path, channelId), getStoreStatus(channelId)]);

  console.log('route', JSON.stringify(route));

  // if (status === 'MAINTENANCE') {
  //   // 503 status code not working - https://github.com/vercel/next.js/issues/50155
  //   return fetch(new URL(`/${locale}/maintenance`, req.url));
  // }

  if (route.redirect) {
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
        const redirectUrl = new URL(redirectPathname, req.url);

        return permanentRedirect(redirectUrl.toString());
      }
    }
  }

  const customerId = await getSessionCustomerId();
  let postfix = '';

  if (!req.nextUrl.search && !customerId) {
    // todo figure out if we need to do anything about  // && req.method === 'GET')
    postfix = '/static';
    // postfix = '';
  }

  const node = route.node;
  let url: string;

  switch (node?.__typename) {
    case 'Brand': {
      url = `/${locale}/brand/${node.entityId}${postfix}`;
      break;
    }

    case 'Category': {
      url = `/${locale}/category/${node.entityId}${postfix}`;
      break;
    }

    case 'Product': {
      url = `/_catalyst/${locale}/product/${node.entityId}${postfix}`;
      break;
    }

    case 'NormalPage': {
      url = `/${locale}/webpages/normal/${node.id}`;
      break;
    }

    case 'ContactPage': {
      url = `/${locale}/webpages/contact/${node.id}`;
      break;
    }

    case 'RawHtmlPage': {
      const { htmlBody } = await getRawWebPageContent(node.id);

      return new Response(htmlBody, {
        headers: { 'content-type': 'text/html' },
      });
    }

    default: {
      url = `/_catalyst/${locale}/404`;
    }
  }

  const routeURL = req.nextUrl.clone();

  routeURL.pathname = url;

  console.log('routeURL', JSON.stringify(routeURL));

  // clone req
  const clonedReq = req.clone();

  // remove accept-encoding header to prevent double gzip compression
  clonedReq.headers.delete('accept-encoding');

  return fetch(routeURL, clonedReq).then((response) => {
    console.log('headers', response.headers);

    // remove content-encoding header to prevent double gzip compression
    // clone the request to avoid mutating the original request
    const clonedResponse = new Response(response.body, response);

    clonedResponse.headers.delete('content-encoding');
    clonedResponse.headers.delete('content-length');
    clonedResponse.headers.delete('transfer-encoding');

    return clonedResponse;
  });
}
