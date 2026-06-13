import { NextResponse } from 'next/server';

import { SESSION_COOKIE_NAME } from '@/lib/auth-shared';
import { isSessionValid } from '@/lib/identity-client';

import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const hasCookie = request.cookies.has(SESSION_COOKIE_NAME);
  const cookieHeader = request.headers.get('cookie') ?? '';

  if (hasCookie && (await isSessionValid(cookieHeader))) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
  matcher: ['/((?!login|api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
};
