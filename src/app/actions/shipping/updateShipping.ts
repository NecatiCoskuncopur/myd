'use server';

import * as Sentry from '@sentry/nextjs';
import mongoose from 'mongoose';
import { ValidationError } from 'yup';

import { generalMessages, shippingMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { Consignee, Shipping } from '@/models';
import updateShippingSchema from '@/schemas/updateShipping.schema';

const { UNAUTHORIZED, UNEXPECTED_ERROR } = generalMessages;
const { ALREADY_LABELED, CONSIGNEE, ID, NOT_FOUND, UPDATESHIPPING } = shippingMessages;

const updateShipping = async (data: ShippingTypes.IUpdateShippingPayload): Promise<ResponseTypes.IActionResponse> => {
  try {
    await connectMongoDB();

    const validatedData = await updateShippingSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    const currentUser = await getCurrentUser();
    if (!currentUser) return { status: 'ERROR', message: UNAUTHORIZED };

    const { shippingId, consignee, ...rest } = validatedData;

    if (rest.package) {
      const { width, height, length } = rest.package;
      if (width && height && length) {
        rest.package.volumetricWeight = Number(((width * height * length) / 5000).toFixed(2));
      }
    }

    if (!mongoose.Types.ObjectId.isValid(shippingId)) {
      return { status: 'ERROR', message: ID.INVALID };
    }

    const shipping = await Shipping.findById(shippingId).select('userId carrier').lean();

    if (!shipping) return { status: 'ERROR', message: NOT_FOUND };

    let userId = currentUser.id;
    if (currentUser.role === 'ADMIN' || currentUser.role === 'OPERATOR') {
      userId = shipping.userId.toString();
    } else if (shipping.userId.toString() !== currentUser.id) {
      return { status: 'ERROR', message: UNAUTHORIZED };
    }

    if (shipping.carrier?.trackingNumber) {
      return { status: 'ERROR', message: ALREADY_LABELED };
    }

    if (consignee?._id) {
      const updatedConsignee = await Consignee.findOneAndUpdate({ _id: consignee._id, userId }, { $set: consignee }, { new: true });

      if (!updatedConsignee) {
        return { status: 'ERROR', message: CONSIGNEE.NOT_FOUND };
      }
    }

    await Shipping.updateOne(
      { _id: shippingId, userId },
      {
        $set: {
          ...rest,
          consignee: consignee,
        },
      },
    );

    return { status: 'OK', message: UPDATESHIPPING.SUCCESS };
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      return { status: 'ERROR', message: error.errors.join(', ') };
    }
    if (error instanceof Error) {
      Sentry.captureException(error);
    }
    return { status: 'ERROR', message: UNEXPECTED_ERROR };
  }
};

export default updateShipping;
