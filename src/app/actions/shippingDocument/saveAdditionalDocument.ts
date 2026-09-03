'use server';

import { generalMessages, shippingMessages } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { ShippingDocument } from '@/models';

const { UNEXPECTED_ERROR, UNAUTHORIZED } = generalMessages;
const { ADDITIONALDOCUMENT } = shippingMessages;

const saveAdditionalDocument = async (formData: FormData): Promise<ResponseTypes.IActionResponse> => {
  try {
    await connectMongoDB();

    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return {
        status: 'ERROR',
        message: UNAUTHORIZED,
      };
    }

    const shippingId = formData.get('shippingId');
    const additionalDocument = formData.get('additionalDocument');

    if (typeof shippingId !== 'string' || !(additionalDocument instanceof File)) {
      return {
        status: 'ERROR',
        message: 'Geçersiz belge.',
      };
    }

    const arrayBuffer = await additionalDocument.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await ShippingDocument.findOneAndUpdate(
      {
        shippingId,
      },
      {
        $set: {
          additionalDocument: buffer,
        },
      },
      {
        upsert: true,
      },
    );

    return {
      status: 'OK',
      message: ADDITIONALDOCUMENT.SUCCESS,
    };
  } catch (error) {
    if (error instanceof Error) {
      captureActionError('saveAdditionalDocument', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default saveAdditionalDocument;
