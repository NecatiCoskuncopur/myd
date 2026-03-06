'use server';

import * as Sentry from '@sentry/nextjs';
import mongoose from 'mongoose';
import { ValidationError } from 'yup';

import { messages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { Consignee, Shipping } from '@/models';
import updateShippingSchema from '@/schemas/updateShipping.schema';

const { GENERAL, SHIPPING } = messages;

const updateShipping = async (data: IUpdateShippingPayload): Promise<IActionResponse> => {
  try {
    await connectMongoDB();

    const validatedData = await updateShippingSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        status: 'ERROR',
        message: GENERAL.UNAUTHORIZED,
      };
    }

    const { shippingId, consignee, ...rest } = validatedData;

    if (!mongoose.Types.ObjectId.isValid(shippingId)) {
      return {
        status: 'ERROR',
        message: SHIPPING.INVALID_ID,
      };
    }

    const shipping = await Shipping.findById(shippingId).select('userId carrier').lean<{
      userId: mongoose.Types.ObjectId;
      carrier?: { trackingNumber?: string };
    }>();

    if (!shipping) {
      return {
        status: 'ERROR',
        message: SHIPPING.NOT_FOUND,
      };
    }

    let userId = currentUser.id;

    if (currentUser.role === 'ADMIN' || currentUser.role === 'OPERATOR') {
      userId = shipping.userId.toString();
    } else if (shipping.userId.toString() !== currentUser.id) {
      return {
        status: 'ERROR',
        message: GENERAL.UNAUTHORIZED,
      };
    }

    if (shipping.carrier?.trackingNumber) {
      return {
        status: 'ERROR',
        message: SHIPPING.ALREADY_LABELED,
      };
    }

    if (consignee?._id) {
      const updatedConsignee = await Consignee.findOneAndUpdate(
        {
          _id: consignee._id,
          userId,
        },
        consignee,
      );

      if (!updatedConsignee) {
        return {
          status: 'ERROR',
          message: SHIPPING.CONSIGNEE.NOT_FOUND,
        };
      }
    }

    await Shipping.updateOne(
      {
        _id: shippingId,
        userId,
      },
      rest,
    );

    return {
      status: 'OK',
      message: SHIPPING.UPDATED,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        status: 'ERROR',
        message: error.errors.join(', '),
      };
    }

    if (error instanceof Error) {
      Sentry.captureException(error);
    }

    return {
      status: 'ERROR',
      message: GENERAL.UNEXPECTED_ERROR,
    };
  }
};

export default updateShipping;
