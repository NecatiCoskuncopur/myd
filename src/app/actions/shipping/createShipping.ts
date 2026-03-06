'use server';

import * as Sentry from '@sentry/nextjs';
import { ValidationError } from 'yup';

import { messages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { Consignee, Shipping, User } from '@/models';
import createShippingSchema from '@/schemas/createShipping.schema';

const { GENERAL, SHIPPING, USER } = messages;

const createShipping = async (data: ICreateShippingPayload): Promise<IActionResponse> => {
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
        message: GENERAL.UNAUTHORIZED,
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
          message: SHIPPING.CONSIGNEE.NOT_FOUND,
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
        message: USER.NOT_FOUND,
      };
    }

    await Shipping.create({
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
      package: validatedData.package,
    });

    return {
      status: 'OK',
      message: SHIPPING.SUCCESS,
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

export default createShipping;
