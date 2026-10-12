import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const clientId = searchParams.get('client_id');
    const codeChallenge = searchParams.get('code_challenge');

    const codeVerifier = request.cookies.get('navlungo_code_verifier')?.value;

    if (!codeVerifier || !clientId || !codeChallenge) {
      return NextResponse.json({ message: 'Callback doğrulama bilgileri eksik.' }, { status: 400 });
    }

    const expectedChallenge = createHash('sha256').update(codeVerifier, 'utf8').digest('base64');

    if (expectedChallenge !== codeChallenge) {
      return NextResponse.json({ message: 'Code challenge doğrulanamadı.' }, { status: 400 });
    }

    const response = NextResponse.json({
      message: 'Authorization code alındı.',
      code,
      client_id: clientId,
    });

    response.cookies.delete('navlungo_code_verifier');

    return response;
  }

  const clientId = process.env.NAVLUNGO_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json({ message: 'NAVLUNGO_CLIENT_ID eksik.' }, { status: 500 });
  }

  const codeVerifier = '7b9d3c2a-5e41-4f8a-9c63-1a2b7d6e4f90';
  const codeChallenge = createHash('sha256').update(codeVerifier, 'utf8').digest('base64');

  const authorizeUrl = new URL('https://navlungo.com/authorize');
  authorizeUrl.searchParams.set('client_id', clientId);
  authorizeUrl.searchParams.set('code_challenge', codeChallenge);

  const response = NextResponse.redirect(authorizeUrl);

  response.cookies.set('navlungo_code_verifier', codeVerifier, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/api/navlungoAuth',
    maxAge: 600,
  });

  return response;
}
