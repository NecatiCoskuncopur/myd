'use server';

import * as Sentry from '@sentry/nextjs';
import { ValidationError } from 'yup';

import { generalMessages, shippingMessages, userMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { Consignee, Shipping, User } from '@/models';
import createShippingSchema from '@/schemas/createShipping.schema';

const { UNAUTHORIZED, UNEXPECTED_ERROR } = generalMessages;
const { CONSIGNEE, CREATESHIPPING } = shippingMessages;
const { NOT_FOUND } = userMessages;

const createShipping = async (data: ShippingTypes.ICreateShippingPayload): Promise<ResponseTypes.IActionResponse<{ _id: string }>> => {
  try {
    await connectMongoDB();

    const validatedData = await createShippingSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        status: 'ERROR',
        message: UNAUTHORIZED,
      };
    }

    const userId = (currentUser.role === 'ADMIN' || currentUser.role === 'OPERATOR') && validatedData.senderId ? validatedData.senderId : currentUser.id;

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

    const user = await User.findById(userId).lean();
    if (!user) {
      return {
        status: 'ERROR',
        message: NOT_FOUND,
      };
    }
    const { width, height, length, weight, numberOfPackage } = validatedData.package;

    const volumetricWeight = width && height && length ? Number(((width * height * length) / 5000).toFixed(2)) : 0;

    const shipping = await Shipping.create({
      userId,

      sender: {
        name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
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
      content: validatedData.content,
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
      Sentry.captureException(error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default createShipping;
