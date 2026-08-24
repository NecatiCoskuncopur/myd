import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { UserRole } from '@/constants';

const managementRoles = [UserRole.OPERATOR, UserRole.ADMIN];

export const proxy = auth(request => {
  const { pathname } = request.nextUrl;

  const user = request.auth?.user;
  const isAuthenticated = Boolean(user?.id);
  const isUserRoute = pathname.startsWith('/kullanici');
  const isPanelRoute = pathname.startsWith('/panel');
  const isManagementRoute = pathname.startsWith('/panel/yonetim');

  if (isAuthenticated && isUserRoute) {
    return NextResponse.redirect(new URL('/panel', request.url));
  }

  if (!isAuthenticated && isPanelRoute) {
    return NextResponse.redirect(new URL('/kullanici/giris', request.url));
  }

  if (isManagementRoute && (!user?.role || !managementRoles.includes(user.role))) {
    return NextResponse.redirect(new URL('/panel', request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/panel/:path*', '/kullanici/:path*'],
};
