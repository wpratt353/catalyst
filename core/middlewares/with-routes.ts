import { cookies } from 'next/headers';
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { z } from 'zod';

import { getSessionCustomerId } from '~/auth';
import { getChannelIdFromLocale } from '~/channels.config';
import { graphql } from '~/client/graphql';
import { getRawWebPageContent } from '~/client/queries/get-raw-web-page-content';
import { getRoute } from '~/client/queries/get-route';
import { getStoreStatus } from '~/client/queries/get-store-status';
import { kvKey, STORE_STATUS_KEY } from '~/lib/kv/keys';

import { defaultLocale, localePrefix, LocalePrefixes, locales } from '../i18n';
import { kv } from '../lib/kv';

import { type MiddlewareFactory } from './compose-middlewares';

const routes = {
  '/retro-sport-color-block-tee/': {
    redirect: null,
    node: { __typename: 'Product', id: 'UHJvZHVjdDoyMzQ=', entityId: 234 },
  },
  '/classic-cable-knit-cardigan/': {
    redirect: null,
    node: { __typename: 'Product', id: 'UHJvZHVjdDoyMjg=', entityId: 228 },
  },
  '/modern-minimalist-ivory-work-jacket/': {
    redirect: null,
    node: { __typename: 'Product', id: 'UHJvZHVjdDoyMDU=', entityId: 205 },
  },
  '/urban-edge-geometric-sunglasses/': {
    redirect: null,
    node: { __typename: 'Product', id: 'UHJvZHVjdDoyMDQ=', entityId: 204 },
  },
  '/nautical-tailored-trousers/': {
    redirect: null,
    node: { __typename: 'Product', id: 'UHJvZHVjdDoyMTM=', entityId: 213 },
  },
  '/urban-edge-distressed-denim-jacket/': {
    redirect: null,
    node: { __typename: 'Product', id: 'UHJvZHVjdDoyMDk=', entityId: 209 },
  },
  '/casual-button-down-shirt/': {
    redirect: null,
    node: { __typename: 'Product', id: 'UHJvZHVjdDoyMTA=', entityId: 210 },
  },
  '/sleek-tailored-business-trousers/': {
    redirect: null,
    node: { __typename: 'Product', id: 'UHJvZHVjdDoyMTc=', entityId: 217 },
  },
  '/metro-sleek-rectangular-sunglasses/': {
    redirect: null,
    node: { __typename: 'Product', id: 'UHJvZHVjdDoyMDI=', entityId: 202 },
  },
  '/urban-explorer-high-waisted-cargo-trousers/': {
    redirect: null,
    node: { __typename: 'Product', id: 'UHJvZHVjdDoyMTY=', entityId: 216 },
  },
  '/luxe-vision-square-frame-sunglasses/': {
    redirect: null,
    node: { __typename: 'Product', id: 'UHJvZHVjdDoyMTE=', entityId: 211 },
  },
  '/bold-stripes-oversized-cardigan/': {
    redirect: null,
    node: { __typename: 'Product', id: 'UHJvZHVjdDoyMjE=', entityId: 221 },
  },
  '/rustic-highland-plaid-flannel-shirt/': {
    redirect: null,
    node: { __typename: 'Product', id: 'UHJvZHVjdDoyMDY=', entityId: 206 },
  },
  '/vibrant-energy-cropped-turtleneck-top/': {
    redirect: null,
    node: { __typename: 'Product', id: 'UHJvZHVjdDoyMzM=', entityId: 233 },
  },
  '/sophisticated-wrap-style-blouse/': {
    redirect: null,
    node: { __typename: 'Product', id: 'UHJvZHVjdDoyMjA=', entityId: 220 },
  },
  '/retro-striped-mock-neck-knit-vest/': {
    redirect: null,
    node: { __typename: 'Product', id: 'UHJvZHVjdDoyMjk=', entityId: 229 },
  },
  '/sunshine-vibes-v-neck-sweater/': {
    redirect: null,
    node: { __typename: 'Product', id: 'UHJvZHVjdDoyMjQ=', entityId: 224 },
  },
  '/serenity-fitted-knit-top/': {
    redirect: null,
    node: { __typename: 'Product', id: 'UHJvZHVjdDoyMjU=', entityId: 225 },
  },
  '/glamour-glitz-oversized-sunglasses/': {
    redirect: null,
    node: { __typename: 'Product', id: 'UHJvZHVjdDoyMTI=', entityId: 212 },
  },
  '/artisanal-cable-knit-turtleneck-sweater/': {
    redirect: null,
    node: { __typename: 'Product', id: 'UHJvZHVjdDoyMTk=', entityId: 219 },
  },
  '/summer-breeze-v-neck-midi-dress/': {
    redirect: null,
    node: { __typename: 'Product', id: 'UHJvZHVjdDoyMzA=', entityId: 230 },
  },
  '/urban-draped-oversized-tee/': {
    redirect: null,
    node: { __typename: 'Product', id: 'UHJvZHVjdDoyMDg=', entityId: 208 },
  },
  '/cozy-comfort-knit-sweater/': {
    redirect: null,
    node: { __typename: 'Product', id: 'UHJvZHVjdDoyMjM=', entityId: 223 },
  },
  '/essential-elegance-turtleneck-top/': {
    redirect: null,
    node: { __typename: 'Product', id: 'UHJvZHVjdDoyMjY=', entityId: 226 },
  },
  '/chic-icon-oversized-sunglasses/': {
    redirect: null,
    node: { __typename: 'Product', id: 'UHJvZHVjdDoyMzE=', entityId: 231 },
  },
  '/classic-clubmaster-revival-sunglasses/': {
    redirect: null,
    node: { __typename: 'Product', id: 'UHJvZHVjdDoyMDM=', entityId: 203 },
  },
  '/modern-flair-peplum-top/': {
    redirect: null,
    node: { __typename: 'Product', id: 'UHJvZHVjdDoyMTg=', entityId: 218 },
  },
  '/iridescent-aura-ruffled-blouse/': {
    redirect: null,
    node: { __typename: 'Product', id: 'UHJvZHVjdDoyMzU=', entityId: 235 },
  },
  '/breeze-short-sleeve-button-up-shirt/': {
    redirect: null,
    node: { __typename: 'Product', id: 'UHJvZHVjdDoyMDc=', entityId: 207 },
  },
  '/modern-safari-cargo-trousers/': {
    redirect: null,
    node: { __typename: 'Product', id: 'UHJvZHVjdDoyMTQ=', entityId: 214 },
  },
  '/soft-knit-pullover/': {
    redirect: null,
    node: { __typename: 'Product', id: 'UHJvZHVjdDoyMjc=', entityId: 227 },
  },
  '/retro-revival-flared-trousers/': {
    redirect: null,
    node: { __typename: 'Product', id: 'UHJvZHVjdDoyMTU=', entityId: 215 },
  },
  '/autumnal-stripes-knit-cardigan/': {
    redirect: null,
    node: { __typename: 'Product', id: 'UHJvZHVjdDoyMjI=', entityId: 222 },
  },
  '/rainbow-retro-ribbed-sweater/': {
    redirect: null,
    node: { __typename: 'Product', id: 'UHJvZHVjdDoyMzI=', entityId: 232 },
  },
  '/all-styles/tops/': {
    redirect: null,
    node: { __typename: 'Category', id: 'Q2F0ZWdvcnk6Njk=', entityId: 69 },
  },
  '/women/pants/': {
    redirect: null,
    node: { __typename: 'Category', id: 'Q2F0ZWdvcnk6Nzg=', entityId: 78 },
  },
  '/men/shirts/': {
    redirect: null,
    node: { __typename: 'Category', id: 'Q2F0ZWdvcnk6NzQ=', entityId: 74 },
  },
  '/all-styles/sweaters-jackets/': {
    redirect: null,
    node: { __typename: 'Category', id: 'Q2F0ZWdvcnk6NzA=', entityId: 70 },
  },
  '/all-styles/': {
    redirect: null,
    node: { __typename: 'Category', id: 'Q2F0ZWdvcnk6NjU=', entityId: 65 },
  },
  '/women/accessories/': {
    redirect: null,
    node: { __typename: 'Category', id: 'Q2F0ZWdvcnk6Nzc=', entityId: 77 },
  },
  '/men/pants/': {
    redirect: null,
    node: { __typename: 'Category', id: 'Q2F0ZWdvcnk6NzM=', entityId: 73 },
  },
  '/all-styles/pants/': {
    redirect: null,
    node: { __typename: 'Category', id: 'Q2F0ZWdvcnk6NzE=', entityId: 71 },
  },
  '/men/': {
    redirect: null,
    node: { __typename: 'Category', id: 'Q2F0ZWdvcnk6NjY=', entityId: 66 },
  },
  '/women/sweaters-jackets/': {
    redirect: null,
    node: { __typename: 'Category', id: 'Q2F0ZWdvcnk6ODA=', entityId: 80 },
  },
  '/women/': {
    redirect: null,
    node: { __typename: 'Category', id: 'Q2F0ZWdvcnk6Njc=', entityId: 67 },
  },
  '/men/accessories/': {
    redirect: null,
    node: { __typename: 'Category', id: 'Q2F0ZWdvcnk6NzI=', entityId: 72 },
  },
  '/men/sweaters-jackets/': {
    redirect: null,
    node: { __typename: 'Category', id: 'Q2F0ZWdvcnk6NzU=', entityId: 75 },
  },
  '/women/shirts-blouses/': {
    redirect: null,
    node: { __typename: 'Category', id: 'Q2F0ZWdvcnk6Nzk=', entityId: 79 },
  },
  '/all-styles/accessories/': {
    redirect: null,
    node: { __typename: 'Category', id: 'Q2F0ZWdvcnk6Njg=', entityId: 68 },
  },
  '/women/tops/': {
    redirect: null,
    node: { __typename: 'Category', id: 'Q2F0ZWdvcnk6ODE=', entityId: 81 },
  },
  '/men/tops/': {
    redirect: null,
    node: { __typename: 'Category', id: 'Q2F0ZWdvcnk6NzY=', entityId: 76 },
  },
  '/your-first-blog-post/': { redirect: null, node: null },
};

type Route = Awaited<ReturnType<typeof getRoute>>;
type StorefrontStatusType = ReturnType<typeof graphql.scalar<'StorefrontStatusType'>>;

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

export const withRoutes: MiddlewareFactory = () => {
  return async (request, event) => {
    let locale = cookies().get('NEXT_LOCALE')?.value || '';

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

    const route = routes[request.nextUrl.pathname] || null;

    await new Promise((resolve) => setTimeout(resolve, 30));

    // Follow redirects if found on the route
    // Use 301 status code as it is more universally supported by crawlers
    const redirectConfig = { status: 301 };

    if (route?.redirect) {
      switch (route.redirect.to.__typename) {
        case 'ManualRedirect': {
          // For manual redirects, redirect to the full URL to handle cases
          // where the destination URL might be external to the site
          return NextResponse.redirect(route.redirect.toUrl, redirectConfig);
        }

        default: {
          // For all other cases, assume an internal redirect and construct the URL
          // based on the current request URL to maintain internal redirection
          // in non-production environments
          const redirectPathname = new URL(route.redirect.toUrl).pathname;
          const redirectUrl = new URL(redirectPathname, request.url);

          return NextResponse.redirect(redirectUrl, redirectConfig);
        }
      }
    }

    const customerId = await getSessionCustomerId();
    let postfix = '';

    if (!request.nextUrl.search && !customerId && request.method === 'GET') {
      postfix = '/static';
    }

    const node = route?.node;
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
        url = `/${locale}/product/${node.entityId}${postfix}`;
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

        return new NextResponse(htmlBody, {
          headers: { 'content-type': 'text/html' },
        });
      }

      default: {
        const { pathname } = new URL(request.url);
        const cleanPathName = clearLocaleFromPath(pathname);

        if (cleanPathName === '/' && postfix) {
          url = `/${locale}${postfix}`;
          break;
        }

        url = `/${locale}${cleanPathName}`;
      }
    }

    const rewriteUrl = new URL(url, request.url);

    rewriteUrl.search = request.nextUrl.search;

    const rewrite = NextResponse.rewrite(rewriteUrl);

    // Add rewrite header to response provided by next-intl
    rewrite.headers.forEach((v, k) => response.headers.set(k, v));

    return response;
  };
};
