'use server';

import { Types } from 'mongoose';

import { additionalDocumentMessages, generalMessages, UserRole } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { AdditionalDocument, Shipping } from '@/models';

const { UNAUTHORIZED, UNEXPECTED_ERROR } = generalMessages;
const { ID } = additionalDocumentMessages;

type AdditionalDocumentResponse = {
  file: string;
  contentType: string;
};

const getAdditionalDocument = async (additionalDocumentId: string): Promise<ResponseTypes.IActionResponse<AdditionalDocumentResponse>> => {
  try {
    await connectMongoDB();

    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return {
        status: 'ERROR',
        message: UNAUTHORIZED,
      };
    }

    if (!Types.ObjectId.isValid(additionalDocumentId)) {
      return {
        status: 'ERROR',
        message: 'Geçersiz belge.',
      };
    }

    const isAdminOrOperator = [UserRole.ADMIN, UserRole.OPERATOR].includes(currentUser.role);

    const shipping = await Shipping.findOne({
      additionalDocumentIds: additionalDocumentId,
      ...(isAdminOrOperator
        ? {}
        : {
            userId: currentUser.id,
          }),
    })
      .select('_id')
      .lean();

    if (!shipping) {
      return {
        status: 'ERROR',
        message: ID.NOT_FOUND,
      };
    }

    const document = await AdditionalDocument.findById(additionalDocumentId).select('data contentType').lean();

    if (!document) {
      return {
        status: 'ERROR',
        message: ID.NOT_FOUND,
      };
    }

    return {
      status: 'OK',
      data: {
        file: document.data.toString('base64'),
        contentType: document.contentType,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      captureActionError('getAdditionalDocument', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default getAdditionalDocument;
