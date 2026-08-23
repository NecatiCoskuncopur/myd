'use server';

import { ValidationError } from 'yup';

import { escapeRegex, generalMessages, pricingListMessages, UserRole } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import isMongoDuplicateKeyError from '@/lib/isMongoDuplicateKeyError';
import requireRoles from '@/lib/requireRoles';
import { PricingList } from '@/models';
import createPricingListSchema from '@/schemas/createPricingList.schema';
import { PricingListTypes } from '@/types/pricingList';

const { EXIST, SUCCESS } = pricingListMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const createPricingList = async (data: PricingListTypes.ICreatePricingListPayload): Promise<ResponseTypes.IActionResponse> => {
  try {
    const authError = await requireRoles([UserRole.ADMIN]);

    if (authError) {
      return authError;
    }

    const validatedData = await createPricingListSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    await connectMongoDB();

    const listName = validatedData.name.trim();
    const safeListName = escapeRegex(listName);

    const existingPricingList = await PricingList.findOne({
      name: {
        $regex: `^${safeListName}$`,
        $options: 'i',
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

    await PricingList.create({
      ...validatedData,
      name: listName,
    });

    return {
      status: 'OK',
      message: SUCCESS,
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
      captureActionError('createPricingList', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default createPricingList;
