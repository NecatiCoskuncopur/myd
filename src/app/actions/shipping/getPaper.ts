'use server';

import { Types } from 'mongoose';

import { generalMessages, shippingMessages, UserRole } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { Shipping, ShippingDocument } from '@/models';
import { ShippingTypes } from '@/types/shipping';

const { UNAUTHORIZED, UNEXPECTED_ERROR } = generalMessages;
const { ID, PAPER } = shippingMessages;

const getPaper = async (params: ShippingTypes.IGetPaperParams): Promise<ResponseTypes.IActionResponse<{ file: string }>> => {
  try {
    await connectMongoDB();

    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return {
        status: 'ERROR',
        message: UNAUTHORIZED,
      };
    }

    if (!Types.ObjectId.isValid(params.shippingId)) {
      return {
        status: 'ERROR',
        message: ID.INVALID,
      };
    }

    if (!['labels', 'invoices'].includes(params.type)) {
      return {
        status: 'ERROR',
        message: PAPER.INVALID_TYPE,
      };
    }

    const isAdminOrOperator = [UserRole.ADMIN, UserRole.OPERATOR].includes(currentUser.role);

    if (!isAdminOrOperator) {
      const shipping = await Shipping.findOne({
        _id: params.shippingId,
        userId: currentUser.id,
      })
        .select('_id')
        .lean();

      if (!shipping) {
        return {
          status: 'ERROR',
          message: PAPER.NOT_FOUND,
        };
      }
    }

    const field = params.type === 'labels' ? 'label' : 'invoice';

    const shippingDocument = await ShippingDocument.findOne({
      shippingId: params.shippingId,
    })
      .select(field)
      .lean();

    if (!shippingDocument?.[field]) {
      return {
        status: 'ERROR',
        message: PAPER.NOT_FOUND,
      };
    }

    return {
      status: 'OK',
      data: {
        file: shippingDocument[field].toString('base64'),
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      captureActionError('getPaper', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default getPaper;
