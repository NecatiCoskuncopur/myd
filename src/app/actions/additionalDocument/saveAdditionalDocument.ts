'use server';

import { ValidationError } from 'yup';

import { AdditionalDocumentContentTypeEnum, generalMessages } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { AdditionalDocument } from '@/models';
import saveAdditionalDocumentSchema from '@/schemas/saveAdditionalDocument.schema';
import { AdditionalDocumentTypes } from '@/types/additionalDocument';

const { UNEXPECTED_ERROR, UNAUTHORIZED } = generalMessages;

const saveAdditionalDocument = async (
  payload: AdditionalDocumentTypes.ISaveAdditionalDocumentPayload,
): Promise<ResponseTypes.IActionResponse<{ id: string }>> => {
  try {
    const validatedData = await saveAdditionalDocumentSchema.validate(payload, {
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

    const data = Buffer.from(await validatedData.file.arrayBuffer());
    const contentType = validatedData.file.type as AdditionalDocumentContentTypeEnum;

    const document = await AdditionalDocument.create({
      data,
      type: validatedData.type,
      contentType,
    });

    return {
      status: 'OK',
      data: {
        id: document._id.toString(),
      },
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
