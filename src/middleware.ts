import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const config = {
  matcher: ['/panel/:path*', '/kullanici/:path*'],
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get('token')?.value;
  const role = req.cookies.get('role')?.value;

  if (!token && pathname.startsWith('/panel')) {
    return NextResponse.redirect(new URL('/kullanici/giris', req.url));
  }

  if (token && pathname.startsWith('/kullanici')) {
    return NextResponse.redirect(new URL('/panel', req.url));
  }

  if (token && role === 'CUSTOMER' && pathname.startsWith('/panel/yonetim')) {
    return NextResponse.redirect(new URL('/panel', req.url));
  }

  return NextResponse.next();
}
