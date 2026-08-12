'use server';

import * as Sentry from '@sentry/nextjs';

import { generalMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { ShippingDocument } from '@/models';

const { UNEXPECTED_ERROR } = generalMessages;

interface ISaveShippingDocumentPayload {
  shippingId: string;
  label: Buffer;
  invoice?: Buffer;
}

const saveShippingDocument = async (data: ISaveShippingDocumentPayload): Promise<ResponseTypes.IActionResponse> => {
  try {
    await connectMongoDB();

    await ShippingDocument.create({
      shippingId: data.shippingId,
      label: data.label,
      ...(data.invoice ? { invoice: data.invoice } : {}),
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

export default saveShippingDocument;
