'use server';

import * as Sentry from '@sentry/nextjs';
import mongoose from 'mongoose';

import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { Storage } from '@/lib/storage';
import { Shipping, ShippingBarcode } from '@/models';
import { generalMessages, shippingMessages, UserRole } from '@/constants';
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

    if (params.type === 'labels') {
      const shippingBarcode = await ShippingBarcode.findOne({
        shippingId: params.shippingId,
      })
        .select('pdf')
        .lean();

      if (!shippingBarcode?.pdf) {
        return {
          status: 'ERROR',
          message: shippingMessages.PAPER.NOT_FOUND,
        };
      }

      return {
        status: 'OK',
        data: {
          file: shippingBarcode.pdf.toString('base64'),
        },
      };
    }

    let paper;

    try {
      paper = await Storage.getObject({
        Key: `${params.shippingId}.pdf`,
        Bucket: params.type,
      });
    } catch (error) {
      Sentry.captureException(error);

      return {
        status: 'ERROR',
        message: generalMessages.UNEXPECTED_ERROR,
      };
    }

    if (!paper.Body) {
      return {
        status: 'ERROR',
        message: shippingMessages.PAPER.NOT_FOUND,
      };
    }

    return {
      status: 'OK',
      data: {
        file: paper.Body.toString('base64'),
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
