'use server';

import * as Sentry from '@sentry/nextjs';
import mongoose from 'mongoose';

import { generalMessages, shippingMessages, UserRole } from '@/constants';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { Shipping, ShippingDocument } from '@/models';
import { ShippingTypes } from '@/types/shipping';

const getPaper = async (params: ShippingTypes.IGetPaperParams): Promise<ResponseTypes.IActionResponse<{ file: string }>> => {
  try {
    await connectMongoDB();

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        status: 'ERROR',
        message: generalMessages.UNAUTHORIZED,
      };
    }

    if (!mongoose.Types.ObjectId.isValid(params.shippingId)) {
      return {
        status: 'ERROR',
        message: shippingMessages.ID.INVALID,
      };
    }

    if (!['labels', 'invoices'].includes(params.type)) {
      return {
        status: 'ERROR',
        message: shippingMessages.PAPER.INVALID_TYPE,
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
          message: shippingMessages.PAPER.NOT_FOUND,
        };
      }
    }

    const field = params.type === 'labels' ? 'label' : 'invoice';

    const shippingBarcode = await ShippingDocument.findOne({
      shippingId: params.shippingId,
    })
      .select(field)
      .lean();

    if (!shippingBarcode?.[field]) {
      return {
        status: 'ERROR',
        message: shippingMessages.PAPER.NOT_FOUND,
      };
    }

    return {
      status: 'OK',
      data: {
        file: shippingBarcode[field].toString('base64'),
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      Sentry.withScope(scope => {
        scope.setTag('action', 'getPaper');
        scope.captureException(error);
      });
    }

    return {
      status: 'ERROR',
      message: generalMessages.UNEXPECTED_ERROR,
    };
  }
};

export default getPaper;
