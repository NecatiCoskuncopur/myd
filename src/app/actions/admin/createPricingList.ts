'use server';

import * as Sentry from '@sentry/nextjs';
import { ValidationError } from 'yup';

import { generalMessages, pricingListMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { PricingList } from '@/models';
import createPricingListSchema from '@/schemas/createPricingList.schema';

const { EXIST, SUCCESS } = pricingListMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const createPricingList = async (data: PricingListTypes.ICreatePricingListPayload): Promise<ResponseTypes.IActionResponse> => {
  try {
    const authError = await requireRoles(['ADMIN']);
    if (authError) return authError;

    await connectMongoDB();

    const validatedData = await createPricingListSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    const listName = validatedData.name.trim();

    const existing = await PricingList.findOne({
      name: { $regex: `^${listName}$`, $options: 'i' },
    });

    if (existing) {
      return { status: 'ERROR', message: EXIST };
    }

    await PricingList.create({
      ...validatedData,
      name: listName,
    });

    return {
      status: 'OK',
      message: SUCCESS,
    };
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      if ((error as { code: number }).code === 11000) {
        return { status: 'ERROR', message: EXIST };
      }
    }

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

export default createPricingList;
