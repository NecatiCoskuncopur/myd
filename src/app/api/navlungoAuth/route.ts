import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';

export const GET = async () => {
  const clientId = process.env.NAVLUNGO_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      {
        message: 'NAVLUNGO_CLIENT_ID eksik.',
      },
      {
        status: 500,
      },
    );
  }

  const codeVerifier = '7b9d3c2a-5e41-4f8a-9c63-1a2b7d6e4f90';
  const codeChallenge = createHash('sha256').update(codeVerifier, 'utf8').digest('base64');

  const authorizeUrl = new URL('https://navlungo.com/authorize');
  authorizeUrl.searchParams.set('client_id', clientId);
  authorizeUrl.searchParams.set('code_challenge', codeChallenge);

  return NextResponse.redirect(authorizeUrl.toString());
};
