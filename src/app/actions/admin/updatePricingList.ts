'use server';

import { ValidationError } from 'yup';

import { messages } from '@/constants';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { PricingList } from '@/models';
import updatePricingListSchema from '@/schemas/updatePricingList.schema';

const { GENERAL, PRICINGLIST } = messages;

const updatePricingList = async (data: IUpdatePricingListPayload): Promise<IActionResponse> => {
  try {
    const authError = await requireRoles(['ADMIN']);
    if (authError) return authError;

    await connectMongoDB();

    const validatedData = await updatePricingListSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    const existingWithName = await PricingList.findOne({
      name: validatedData.name,
      _id: { $ne: validatedData.pricingListId },
    });
    if (existingWithName) {
      return { status: 'ERROR', message: PRICINGLIST.EXIST };
    }

    const { name, zone } = validatedData;
    const updated = await PricingList.findByIdAndUpdate(validatedData.pricingListId, { $set: { name, zone } }, { new: true });

    if (!updated) {
      return { status: 'ERROR', message: PRICINGLIST.NOT_FOUND };
    }

    return {
      status: 'OK',
      message: PRICINGLIST.UPDATE,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        status: 'ERROR',
        message: error.errors.join(', '),
      };
    }

    return {
      status: 'ERROR',
      message: GENERAL.UNEXPECTED_ERROR,
    };
  }
};

export default updatePricingList;
