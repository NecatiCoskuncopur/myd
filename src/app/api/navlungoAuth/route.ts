import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    return NextResponse.json({ code });
  }

  const clientId = process.env.NAVLUNGO_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json({ message: 'NAVLUNGO_CLIENT_ID eksik.' }, { status: 500 });
  }

  const authorizeUrl = new URL('https://navlungo.com/authorize');
  authorizeUrl.searchParams.set('client_id', clientId);

  return NextResponse.redirect(authorizeUrl);
}
