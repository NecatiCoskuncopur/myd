'use server';

import * as Sentry from '@sentry/nextjs';
import mongoose from 'mongoose';

import { messages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { Storage } from '@/lib/storage';
import { Shipping } from '@/models';

const { GENERAL, SHIPPING } = messages;

const getPaper = async (params: IGetPaperParams): Promise<IActionResponse<{ file: string }>> => {
  try {
    await connectMongoDB();

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        status: 'ERROR',
        message: GENERAL.UNAUTHORIZED,
      };
    }

    if (!mongoose.Types.ObjectId.isValid(params.shippingId)) {
      return {
        status: 'ERROR',
        message: SHIPPING.INVALID_ID,
      };
    }

    if (!['labels', 'invoices'].includes(params.type)) {
      return {
        status: 'ERROR',
        message: SHIPPING.INVALID_PAPER_TYPE,
      };
    }

    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'OPERATOR') {
      const shipping = await Shipping.findOne({
        _id: params.shippingId,
        userId: currentUser.id,
      })
        .select('_id')
        .lean();

      if (!shipping) {
        return {
          status: 'ERROR',
          message: SHIPPING.PAPER_NOT_FOUND,
        };
      }
    }

    let paper;

    try {
      paper = await Storage.getObject({
        Key: `${params.shippingId}.pdf`,
        Bucket: params.type,
      });
    } catch {
      return {
        status: 'ERROR',
        message: SHIPPING.PAPER_NOT_FOUND,
      };
    }

    const base64File = paper.Body.toString('base64');

    return {
      status: 'OK',
      data: {
        file: base64File,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      Sentry.captureException(error);
    }

    return {
      status: 'ERROR',
      message: GENERAL.UNEXPECTED_ERROR,
    };
  }
};

export default getPaper;
