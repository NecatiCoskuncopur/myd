'use server';

import { ValidationError } from 'yup';

import { generalMessages, shippingMessages } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import isMongoDuplicateKeyError from '@/lib/isMongoDuplicateKeyError';
import { ShippingDocument } from '@/models';
import saveShippingDocumentSchema from '@/schemas/saveShippingDocument.schema';

const { UNEXPECTED_ERROR, UNAUTHORIZED } = generalMessages;

const { LABEL } = shippingMessages;

const saveShippingDocument = async (data: ShippingDocumentTypes.ISaveShippingDocumentPayload): Promise<ResponseTypes.IActionResponse> => {
  try {
    const validatedData = await saveShippingDocumentSchema.validate(data, {
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

    await ShippingDocument.create({
      shippingId: validatedData.shippingId,
      label: validatedData.label,
      ...(validatedData.invoice ? { invoice: validatedData.invoice } : {}),
    });

    return {
      status: 'OK',
      message: LABEL.SUCCESS,
    };
  } catch (error) {
    if (isMongoDuplicateKeyError(error)) {
      return {
        status: 'ERROR',
        message: LABEL.EXISTS,
      };
    }

    if (error instanceof ValidationError) {
      return {
        status: 'ERROR',
        message: error.errors.join(', '),
      };
    }

    if (error instanceof Error) {
      captureActionError('saveShippingDocument', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default saveShippingDocument;
