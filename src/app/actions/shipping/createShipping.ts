'use server';

import { ValidationError } from 'yup';

import { generalMessages, INSURANCE_RATE, shippingMessages, userMessages, VOLUMETRIC_WEIGHT_DIVISOR } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { Consignee, Shipping, User } from '@/models';
import createShippingSchema from '@/schemas/createShipping.schema';
import { ShippingTypes } from '@/types/shipping';

const { UNAUTHORIZED, UNEXPECTED_ERROR } = generalMessages;
const { CONSIGNEE, CREATESHIPPING } = shippingMessages;
const { NOT_FOUND } = userMessages;

const createShipping = async (data: ShippingTypes.ICreateShippingPayload): Promise<ResponseTypes.IActionResponse<{ _id: string }>> => {
  try {
    const validatedData = await createShippingSchema.validate(data, {
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

    const isStaff = currentUser.role === 'ADMIN' || currentUser.role === 'OPERATOR';
    const userId = isStaff && validatedData.senderId ? validatedData.senderId : currentUser.id;
    const user = await User.findById(userId).select('firstName lastName nickname company phone email address').lean();

    if (!user) {
      return {
        status: 'ERROR',
        message: NOT_FOUND,
      };
    }

    const { width, height, length, weight, numberOfPackage } = validatedData.package;

    const volumetricWeight = width != null && height != null && length != null ? Number(((width * height * length) / VOLUMETRIC_WEIGHT_DIVISOR).toFixed(2)) : 0;

    const totalProductValue = Number(validatedData.content.products.reduce((total, product) => total + product.unitPrice * product.piece, 0).toFixed(2));

    const insuranceAmount = validatedData.content.insurance ? Number((totalProductValue * INSURANCE_RATE).toFixed(2)) : 0;

    let consigneeDoc;

    if (validatedData.consignee._id) {
      consigneeDoc = await Consignee.findOne({
        _id: validatedData.consignee._id,
        userId,
      }).lean();

      if (!consigneeDoc) {
        return {
          status: 'ERROR',
          message: CONSIGNEE.NOT_FOUND,
        };
      }
    } else {
      consigneeDoc = await Consignee.create({
        userId,
        ...validatedData.consignee,
      });
    }

    const shipping = await Shipping.create({
      userId,
      sender: {
        name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
        nickname: user.nickname,
        company: user.company,
        phone: user.phone,
        email: user.email,
        address: user.address,
      },

      consignee: {
        name: consigneeDoc.name,
        company: consigneeDoc.company,
        phone: consigneeDoc.phone,
        email: consigneeDoc.email,
        taxId: consigneeDoc.taxId,
        address: consigneeDoc.address,
      },

      detail: validatedData.detail,

      content: {
        ...validatedData.content,
        insuranceAmount,
      },

      package: {
        weight,
        volumetricWeight,
        width,
        height,
        length,
        numberOfPackage,
      },
    });

    return {
      status: 'OK',
      message: CREATESHIPPING.SUCCESS,
      data: {
        _id: shipping._id.toString(),
      },
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        status: 'ERROR',
        message: error.errors.join(', '),
      };
    }

    if (error instanceof Error) {
      captureActionError('createShipping', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default createShipping;
