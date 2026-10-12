import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';

export const GET = async (request: Request) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  const cookieStore = await cookies();

  if (error) {
    return NextResponse.json({ error, message: 'Navlungo yetkilendirmesi reddedildi.' }, { status: 400 });
  }

  if (code) {
    const codeVerifier = cookieStore.get('navlungo_code_verifier')?.value;

    return NextResponse.json({
      success: true,
      authorization_code: code,
      code_verifier: codeVerifier,
      message: 'Authorization code başarıyla alındı!',
    });
  }

  const clientId = process.env.NAVLUNGO_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json({ message: 'NAVLUNGO_CLIENT_ID eksik.' }, { status: 500 });
  }

  const codeVerifier = '7b9d3c2a-5e41-4f8a-9c63-1a2b7d6e4f90';
  const codeChallenge = createHash('sha256').update(codeVerifier, 'utf8').digest('base64');

  cookieStore.set('navlungo_code_verifier', codeVerifier, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 10 * 60,
  });

  const authorizeUrl = new URL('https://navlungo.com/authorize');
  authorizeUrl.searchParams.set('client_id', clientId);
  authorizeUrl.searchParams.set('code_challenge', codeChallenge);
  authorizeUrl.searchParams.set('code_challenge_method', 'S256');

  return NextResponse.redirect(authorizeUrl.toString());
};
