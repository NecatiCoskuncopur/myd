'use server';

import * as Sentry from '@sentry/nextjs';
import { ValidationError } from 'yup';

import { generalMessages, pricingListMessages, UserRole } from '@/constants';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { PricingList } from '@/models';
import createPricingListSchema from '@/schemas/createPricingList.schema';
import { PricingListTypes } from '@/types/pricingList';

const { EXIST, SUCCESS } = pricingListMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const createPricingList = async (data: PricingListTypes.ICreatePricingListPayload): Promise<ResponseTypes.IActionResponse> => {
  try {
    const authError = await requireRoles([UserRole.ADMIN]);
    if (authError) return authError;

    const validatedData = await createPricingListSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
    await connectMongoDB();

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
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code?: unknown }).code === 11000) {
      return { status: 'ERROR', message: EXIST };
    }

    if (error instanceof ValidationError) {
      return {
        status: 'ERROR',
        message: error.errors.join(', '),
      };
    }

    if (error instanceof Error) {
      Sentry.withScope(scope => {
        scope.setTag('action', 'createPricingList');
        scope.captureException(error);
      });
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default createPricingList;
