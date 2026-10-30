import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

import syncShippingTrackingStatuses from '@/lib/carriers/syncShippingTrackingStatuses';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const { searchParams } = new URL(req.url);
    const secretParam = searchParams.get('secret');
    const expectedSecret = process.env.CRON_SECRET;

    const isAuthorized = authHeader === `Bearer ${expectedSecret}` || secretParam === expectedSecret;

    if (expectedSecret && !isAuthorized) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const result = await syncShippingTrackingStatuses();

    return NextResponse.json({
      status: 'OK',
      data: result,
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        operation: 'TRACK_SHIPPINGS_CRON',
        route: '/api/cron/track-shippings',
      },
      extra: {
        method: req.method,
        userAgent: req.headers.get('user-agent'),
      },
    });

    return NextResponse.json(
      {
        status: 'ERROR',
        message: 'Tracking senkronizasyonu sırasında bir hata oluştu.',
      },
      { status: 500 },
    );
  }
}
