'use server';

import * as Sentry from '@sentry/nextjs';
import { ValidationError } from 'yup';

import { generalMessages, pricingListMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { PricingList } from '@/models';
import updatePricingListSchema from '@/schemas/updatePricingList.schema';

const { EXIST, NOT_FOUND, UPDATE } = pricingListMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const updatePricingList = async (data: PricingListTypes.IUpdatePricingListPayload): Promise<ResponseTypes.IActionResponse> => {
  try {
    const authError = await requireRoles(['ADMIN']);
    if (authError) return authError;

    await connectMongoDB();

    const validatedData = await updatePricingListSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    const { pricingListId, ...updateFields } = validatedData;

    const existingWithName = await PricingList.findOne({
      name: { $regex: `^${updateFields.name?.trim()}$`, $options: 'i' },
      _id: { $ne: pricingListId },
    });

    if (existingWithName) {
      return { status: 'ERROR', message: EXIST };
    }

    const updated = await PricingList.findByIdAndUpdate(pricingListId, { $set: updateFields }, { new: true, runValidators: true });

    if (!updated) {
      return { status: 'ERROR', message: NOT_FOUND };
    }

    return {
      status: 'OK',
      message: UPDATE,
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

export default updatePricingList;
