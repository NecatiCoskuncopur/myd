'use server';

import * as Sentry from '@sentry/nextjs';

import { generalMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { ShippingBarcode } from '@/models';

const { UNEXPECTED_ERROR } = generalMessages;

interface ISaveShippingLabelPayload {
  shippingId: string;
  pdf: Buffer;
}

const saveShippingLabel = async (data: ISaveShippingLabelPayload): Promise<ResponseTypes.IActionResponse> => {
  try {
    await connectMongoDB();

    await ShippingBarcode.create({
      shippingId: data.shippingId,
      pdf: data.pdf,
    });

    return {
      status: 'OK',
      message: 'Shipping label başarıyla kaydedildi.',
    };
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code?: unknown }).code === 11000) {
      return {
        status: 'ERROR',
        message: 'Bu shipping için zaten bir label mevcut.',
      };
    }

    if (error instanceof Error) {
      Sentry.withScope(scope => {
        scope.setTag('action', 'saveShippingLabel');
        scope.captureException(error);
      });
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default saveShippingLabel;
