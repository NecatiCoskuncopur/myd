'use server';

import { Types } from 'mongoose';

import { additionalDocumentMessages, generalMessages, UserRole } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { AdditionalDocument } from '@/models';

const { UNEXPECTED_ERROR, UNAUTHORIZED } = generalMessages;
const { DELETE, ID } = additionalDocumentMessages;

const deleteAdditionalDocument = async (additionalDocumentId: string): Promise<ResponseTypes.IActionResponse> => {
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
        message: ID.INVALID,
      };
    }

    const canDeleteAnyDocument = [UserRole.OPERATOR, UserRole.ADMIN].includes(currentUser.role);

    const document = await AdditionalDocument.findOneAndDelete({
      _id: additionalDocumentId,
      ...(canDeleteAnyDocument
        ? {}
        : {
            userId: currentUser.id,
          }),
    });

    if (!document) {
      return {
        status: 'ERROR',
        message: ID.NOT_FOUND,
      };
    }

    return {
      status: 'OK',
      message: DELETE.SUCCESS,
    };
  } catch (error) {
    if (error instanceof Error) {
      captureActionError('deleteAdditionalDocument', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default deleteAdditionalDocument;
