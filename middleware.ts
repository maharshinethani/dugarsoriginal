import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const ADMIN_PREFIX = '/admin';
const ADMIN_LOGIN = '/admin/login';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only run auth checks on /admin routes (except login itself)
  if (!pathname.startsWith(ADMIN_PREFIX)) {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Redirect authenticated users away from login page
  if (pathname === ADMIN_LOGIN && session) {
    const adminUrl = new URL('/admin', req.url);
    return NextResponse.redirect(adminUrl);
  }

  // Block unauthenticated access to admin routes (except login itself)
  if (pathname !== ADMIN_LOGIN && !session) {
    const loginUrl = new URL(ADMIN_LOGIN, req.url);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|opengraph-image|robots.txt|sitemap.xml).*)'],
};
