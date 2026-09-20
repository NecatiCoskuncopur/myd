'use server';

import { Types } from 'mongoose';

import { AdditionalDocumentContentTypeEnum, generalMessages, UserRole } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { AdditionalDocument, Shipping } from '@/models';
import { AdditionalDocumentTypes } from '@/types/additionalDocument';

const { UNEXPECTED_ERROR, UNAUTHORIZED } = generalMessages;

const getAdditionalDocuments = async (shippingId: string): Promise<ResponseTypes.IActionResponse<AdditionalDocumentTypes.IAdditionalDocument[]>> => {
  try {
    await connectMongoDB();

    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return {
        status: 'ERROR',
        message: UNAUTHORIZED,
      };
    }

    if (!Types.ObjectId.isValid(shippingId)) {
      return {
        status: 'ERROR',
        message: 'Geçersiz gönderi.',
      };
    }

    const canAccessAnyShipping = [UserRole.OPERATOR, UserRole.ADMIN].includes(currentUser.role);

    const shipping = await Shipping.findOne({
      _id: shippingId,
      ...(canAccessAnyShipping
        ? {}
        : {
            userId: currentUser.id,
          }),
    })
      .select('additionalDocumentIds')
      .lean();

    if (!shipping) {
      return {
        status: 'ERROR',
        message: 'Gönderi bulunamadı.',
      };
    }

    if (!shipping.additionalDocumentIds?.length) {
      return {
        status: 'OK',
        data: [],
      };
    }

    const documents = await AdditionalDocument.find({
      _id: {
        $in: shipping.additionalDocumentIds,
      },
    })
      .select('_id type contentType')
      .lean();

    return {
      status: 'OK',
      data: documents.map(document => ({
        id: document._id.toString(),
        contentType: document.contentType as AdditionalDocumentContentTypeEnum,
      })),
    };
  } catch (error) {
    if (error instanceof Error) {
      captureActionError('getAdditionalDocuments', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default getAdditionalDocuments;
