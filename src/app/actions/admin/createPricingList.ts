'use server';

import * as Sentry from '@sentry/nextjs';
import { ValidationError } from 'yup';

import { messages } from '@/constants';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { PricingList } from '@/models';
import createPricingListSchema from '@/schemas/createPricingList.schema';

const { GENERAL, PRICINGLIST } = messages;

const createPricingList = async (data: ICreatePricingListPayload): Promise<IActionResponse> => {
  try {
    const authError = await requireRoles(['ADMIN']);
    if (authError) return authError;

    await connectMongoDB();

    const validatedData = await createPricingListSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    const existing = await PricingList.findOne({ name: validatedData.name });
    if (existing) {
      return { status: 'ERROR', message: PRICINGLIST.EXIST };
    }

    await PricingList.create(validatedData);

    return {
      status: 'OK',
      message: PRICINGLIST.SUCCESS,
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

export default createPricingList;
