'use server';

import * as Sentry from '@sentry/nextjs';
import { ValidationError } from 'yup';

import { generalMessages, pricingListMessages, UserRole } from '@/constants';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { PricingList } from '@/models';
import updatePricingListSchema from '@/schemas/updatePricingList.schema';
import { PricingListTypes } from '@/types/pricingList';

const { EXIST, NOT_FOUND, UPDATE } = pricingListMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const updatePricingList = async (data: PricingListTypes.IUpdatePricingListPayload): Promise<ResponseTypes.IActionResponse> => {
  try {
    const authError = await requireRoles([UserRole.ADMIN]);
    if (authError) return authError;

    const validatedData = await updatePricingListSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
    await connectMongoDB();

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
        scope.setTag('action', 'updatePricingList');
        scope.captureException(error);
      });
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default updatePricingList;
