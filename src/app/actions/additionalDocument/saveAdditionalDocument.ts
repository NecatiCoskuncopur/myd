'use server';

import { Types } from 'mongoose';
import { ValidationError } from 'yup';

import { AdditionalDocumentContentTypeEnum, additionalDocumentMessages, generalMessages, MAX_DOCUMENT_SIZE } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { AdditionalDocument, Shipping } from '@/models';
import saveAdditionalDocumentSchema from '@/schemas/saveAdditionalDocument.schema';
import { AdditionalDocumentTypes } from '@/types/additionalDocument';

const { UNEXPECTED_ERROR, UNAUTHORIZED } = generalMessages;
const { FILE } = additionalDocumentMessages;

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

    if (validatedData.shippingId && !Types.ObjectId.isValid(validatedData.shippingId)) {
      return {
        status: 'ERROR',
        message: 'Geçersiz gönderi.',
      };
    }

    if (validatedData.file.size > MAX_DOCUMENT_SIZE) {
      return {
        status: 'ERROR',
        message: FILE.SIZE,
      };
    }

    const data = Buffer.from(await validatedData.file.arrayBuffer());

    const contentType = validatedData.file.type as AdditionalDocumentContentTypeEnum;

    const document = await AdditionalDocument.create({
      userId: currentUser.id,
      data,
      contentType,
    });

    if (validatedData.shippingId) {
      const shipping = await Shipping.findByIdAndUpdate(validatedData.shippingId, {
        $addToSet: {
          additionalDocumentIds: document._id,
        },
      });

      if (!shipping) {
        await AdditionalDocument.findByIdAndDelete(document._id);

        return {
          status: 'ERROR',
          message: 'Gönderi bulunamadı.',
        };
      }
    }

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
