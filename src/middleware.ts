import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export const config = {
  matcher: ['/panel/:path*', '/kullanici/:path*'],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;

  if (token && pathname.startsWith('/kullanici')) {
    try {
      await jwtVerify(token, secret);
      return NextResponse.redirect(new URL('/panel', req.url));
    } catch (e) {
      const response = NextResponse.next();
      response.cookies.delete('token');
      return response;
    }
  }

  if (!token && pathname.startsWith('/panel')) {
    return NextResponse.redirect(new URL('/kullanici/giris', req.url));
  }

  if (token && pathname.startsWith('/panel')) {
    try {
      const { payload } = await jwtVerify(token, secret);
      const userRole = payload.role as string;

      if (userRole === 'CUSTOMER' && pathname.startsWith('/panel/yonetim')) {
        return NextResponse.redirect(new URL('/panel', req.url));
      }
    } catch (e) {
      const response = NextResponse.redirect(new URL('/kullanici/giris', req.url));
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}
