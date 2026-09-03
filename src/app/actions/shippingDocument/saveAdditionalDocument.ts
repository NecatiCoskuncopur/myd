'use server';

import { ValidationError } from 'yup';

import { generalMessages, shippingMessages } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { ShippingDocument } from '@/models';
import saveAdditionalDocumentSchema from '@/schemas/saveAdditionalDocument.schema';

const { UNEXPECTED_ERROR, UNAUTHORIZED } = generalMessages;
const { ADDITIONALDOCUMENT } = shippingMessages;

const saveAdditionalDocument = async (data: ShippingDocumentTypes.ISaveAdditionalDocumentPayload): Promise<ResponseTypes.IActionResponse> => {
  try {
    const validatedData = await saveAdditionalDocumentSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    await connectMongoDB();

    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return {
        status: 'ERROR',
        message: UNAUTHORIZED,
      };
    }

    await ShippingDocument.findOneAndUpdate(
      {
        shippingId: validatedData.shippingId,
      },
      {
        $set: {
          additionalDocument: validatedData.additionalDocument,
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
    if (error instanceof ValidationError) {
      return {
        status: 'ERROR',
        message: error.errors.join(', '),
      };
    }

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
