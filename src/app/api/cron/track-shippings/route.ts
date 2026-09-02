import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

import syncShippingTrackingStatuses from '@/lib/carriers/syncShippingTrackingStatuses';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = async (request: NextRequest) => {
  const secret = request.headers.get('x-cron-secret');

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json(
      {
        message: 'Unauthorized',
      },
      {
        status: 401,
      },
    );
  }

  try {
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
        method: request.method,
        userAgent: request.headers.get('user-agent'),
      },
    });

    return NextResponse.json(
      {
        status: 'ERROR',
        message: 'Tracking senkronizasyonu sırasında bir hata oluştu.',
      },
      {
        status: 500,
      },
    );
  }
};
