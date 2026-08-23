'use server';

import { ValidationError } from 'yup';

import { escapeRegex, generalMessages, pricingListMessages, UserRole } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import isMongoDuplicateKeyError from '@/lib/isMongoDuplicateKeyError';
import requireRoles from '@/lib/requireRoles';
import { PricingList } from '@/models';
import updatePricingListSchema from '@/schemas/updatePricingList.schema';
import { PricingListTypes } from '@/types/pricingList';

const { EXIST, NOT_FOUND, UPDATE } = pricingListMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const updatePricingList = async (data: PricingListTypes.IUpdatePricingListPayload): Promise<ResponseTypes.IActionResponse> => {
  try {
    const authError = await requireRoles([UserRole.ADMIN]);

    if (authError) {
      return authError;
    }

    const validatedData = await updatePricingListSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    await connectMongoDB();

    const { pricingListId, ...updateFields } = validatedData;

    const normalizedName = updateFields.name?.trim();

    if (normalizedName) {
      const existingPricingList = await PricingList.findOne({
        name: {
          $regex: `^${escapeRegex(normalizedName)}$`,
          $options: 'i',
        },
        _id: {
          $ne: pricingListId,
        },
      })
        .select('_id')
        .lean();

      if (existingPricingList) {
        return {
          status: 'ERROR',
          message: EXIST,
        };
      }

      updateFields.name = normalizedName;
    }

    const updatedPricingList = await PricingList.findByIdAndUpdate(
      pricingListId,
      {
        $set: updateFields,
      },
      {
        runValidators: true,
      },
    );

    if (!updatedPricingList) {
      return {
        status: 'ERROR',
        message: NOT_FOUND,
      };
    }

    return {
      status: 'OK',
      message: UPDATE,
    };
  } catch (error) {
    if (isMongoDuplicateKeyError(error)) {
      return {
        status: 'ERROR',
        message: EXIST,
      };
    }

    if (error instanceof ValidationError) {
      return {
        status: 'ERROR',
        message: error.errors.join(', '),
      };
    }

    if (error instanceof Error) {
      captureActionError('updatePricingList', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default updatePricingList;
