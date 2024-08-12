import { NextURL } from 'next/dist/server/web/next-url';
import { NextRequest } from 'next/server';

import { GET as proxiedGET } from '../../../[locale]/(default)/[...path]/route';

export const GET = async (request: NextRequest) => {
  const newUrl = new NextURL(request.nextUrl);

  if (process.env.VERCEL_URL) {
    newUrl.host = process.env.VERCEL_URL;
    newUrl.port = '443';
  }

  newUrl.pathname = newUrl.pathname.replace('/_catalyst/static', '');

  return proxiedGET(new NextRequest(newUrl));
};

export const dynamic = 'force-static';
export const revalidate = 3600;
export const fetchCache = 'force-cache';
// CDN cache currently only works on nodejs runtime
export const runtime = 'nodejs';
