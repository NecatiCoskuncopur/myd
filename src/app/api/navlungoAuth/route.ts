import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createHash, randomUUID } from 'node:crypto';

export const GET = async (request: Request) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  const cookieStore = await cookies();

  if (error) {
    return NextResponse.json({ error, message: 'Navlungo yetkilendirmesi reddedildi veya hata oluştu.' }, { status: 400 });
  }

  if (code) {
    const codeVerifier = cookieStore.get('navlungo_code_verifier')?.value;

    if (!codeVerifier) {
      return NextResponse.json({ message: 'Code verifier bulunamadı veya süresi doldu.' }, { status: 400 });
    }

    const clientId = process.env.NAVLUNGO_CLIENT_ID;
    const clientSecret = process.env.NAVLUNGO_CLIENT_SECRET; // Gerekiyorsa
    const redirectUri = 'https://myd-iota.vercel.app/api/navlungoAuth'; // veya dinamik alınabilir

    try {
      const tokenResponse = await fetch('https://navlungo.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret, // API dokümanınıza göre gerekebilir
          grant_type: 'authorization_code',
          code: code,
          code_verifier: codeVerifier,
          redirect_uri: redirectUri,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        return NextResponse.json({ message: 'Token alınamadı', details: tokenData }, { status: tokenResponse.status });
      }

      return NextResponse.json({
        success: true,
        message: 'Navlungo bağlantısı başarıyla tamamlandı!',
        tokens: tokenData,
      });
    } catch (err: any) {
      return NextResponse.json({ message: 'Token değişimi sırasında hata oluştu', error: err.message }, { status: 500 });
    }
  }

  const clientId = process.env.NAVLUNGO_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json({ message: 'NAVLUNGO_CLIENT_ID eksik.' }, { status: 500 });
  }

  const codeVerifier = randomUUID();
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

  return NextResponse.redirect(authorizeUrl.toString());
};
