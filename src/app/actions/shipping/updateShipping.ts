'use server';

import { Types } from 'mongoose';
import { ValidationError } from 'yup';

import { generalMessages, shippingMessages, ShippingPayor, ShippingStatus, UserRole, VOLUMETRIC_WEIGHT_DIVISOR } from '@/constants';
import calculateCustomsTax from '@/lib/calculateCustomsTax';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import getInsuranceRate from '@/lib/getInsuranceRate';
import { Consignee, Shipping, SystemParam } from '@/models';
import updateShippingSchema from '@/schemas/updateShipping.schema';
import { ShippingTypes } from '@/types/shipping';

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

    if (!currentUser?.id) {
      return {
        status: 'ERROR',
        message: UNAUTHORIZED,
      };
    }

    const { shippingId, consignee, ...rest } = validatedData;

    if (!Types.ObjectId.isValid(shippingId)) {
      return {
        status: 'ERROR',
        message: ID.INVALID,
      };
    }

    const shipping = await Shipping.findById(shippingId).select('userId carrier status').lean();

    if (!shipping) {
      return {
        status: 'ERROR',
        message: NOT_FOUND,
      };
    }

    let userId = currentUser.id;

    if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.OPERATOR) {
      userId = shipping.userId.toString();
    } else if (shipping.userId.toString() !== currentUser.id) {
      return {
        status: 'ERROR',
        message: UNAUTHORIZED,
      };
    }

    if (shipping.carrier?.trackingNumber || shipping.status === ShippingStatus.LABELED) {
      return {
        status: 'ERROR',
        message: ALREADY_LABELED,
      };
    }

    if (rest.package) {
      const { width, height, length } = rest.package;

      if (width != null && height != null && length != null) {
        rest.package.volumetricWeight = Number(((width * height * length) / VOLUMETRIC_WEIGHT_DIVISOR).toFixed(2));
      }
    }

    const totalProductValue = Number(rest.content.products.reduce((total, product) => total + product.unitPrice * product.piece, 0).toFixed(2));

    const insuranceRate = await getInsuranceRate();
    const insuranceAmount = validatedData.content.insurance ? Number((totalProductValue * (insuranceRate / 100)).toFixed(2)) : 0;
    const customsTaxAmount = rest.detail.payor?.customs === ShippingPayor.SENDER ? await calculateCustomsTax(totalProductValue, consignee.address.country) : 0;
    const serviceFee =
      validatedData.detail.payor?.customs === ShippingPayor.SENDER ? Number((await SystemParam.findOne({ key: 'SERVICE_FEE' }).lean())?.value ?? 0) : 0;

    const content = {
      ...rest.content,
      insuranceAmount,
      customsTaxAmount,
      serviceFee,
    };
    if (consignee?._id) {
      const { _id: consigneeId, ...consigneeData } = consignee;

      const updatedConsignee = await Consignee.findOneAndUpdate(
        {
          _id: consigneeId,
          userId,
        },
        {
          $set: consigneeData,
        },
        {
          new: true,
          runValidators: true,
        },
      );

      if (!updatedConsignee) {
        return {
          status: 'ERROR',
          message: CONSIGNEE.NOT_FOUND,
        };
      }
    }

    const result = await Shipping.updateOne(
      {
        _id: shippingId,
        userId,
        status: {
          $ne: ShippingStatus.LABELED,
        },
      },
      {
        $set: {
          ...rest,
          content,
          consignee,
        },
      },
      {
        runValidators: true,
      },
    );

    if (result.matchedCount === 0) {
      return {
        status: 'ERROR',
        message: ALREADY_LABELED,
      };
    }

    return {
      status: 'OK',
      message: result.modifiedCount > 0 ? UPDATESHIPPING.SUCCESS : UPDATESHIPPING.NOCHANGE,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        status: 'ERROR',
        message: error.errors.join(', '),
      };
    }

    if (error instanceof Error) {
      captureActionError('updateShipping', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default updateShipping;
