'use server';

import * as Sentry from '@sentry/nextjs';
import mongoose from 'mongoose';
import { ValidationError } from 'yup';

import { generalMessages, shippingMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { Consignee, Shipping } from '@/models';
import updateShippingSchema from '@/schemas/updateShipping.schema';
import { ShippingTypes } from '@/types/shipping';
import { UserRole } from '@/constants';

const { UNAUTHORIZED, UNEXPECTED_ERROR } = generalMessages;
const { ALREADY_LABELED, CONSIGNEE, ID, NOT_FOUND, UPDATESHIPPING } = shippingMessages;

const updateShipping = async (data: ShippingTypes.IUpdateShippingPayload): Promise<ResponseTypes.IActionResponse> => {
  try {
    const validatedData = await updateShippingSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
    await connectMongoDB();

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
    if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.OPERATOR) {
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

    const totalProductValue = validatedData.content.products.reduce((total, product) => total + product.unitPrice * product.piece, 0);
    const insurance = validatedData.content.insurance ?? 0;
    const currency = validatedData.content.currency;

    if (insurance && totalProductValue !== insurance) {
      return {
        status: 'ERROR',
        message: `Sigorta bedeli (${insurance} ${currency}) ürünlerin toplam tutarı (${totalProductValue} ${currency}) ile eşleşmelidir!.`,
      };
    }

    const result = await Shipping.updateOne(
      { _id: shippingId, userId },
      {
        $set: {
          ...rest,
          consignee,
        },
      },
    );
    if (result.modifiedCount === 0) {
      return { status: 'ERROR', message: UPDATESHIPPING.NOCHANGE };
    }

    return { status: 'OK', message: UPDATESHIPPING.SUCCESS };
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      return { status: 'ERROR', message: error.errors.join(', ') };
    }
    if (error instanceof Error) {
      Sentry.withScope(scope => {
        scope.setTag('action', 'updateShipping');
        scope.captureException(error);
      });
    }
    return { status: 'ERROR', message: UNEXPECTED_ERROR };
  }
};

export default updateShipping;
