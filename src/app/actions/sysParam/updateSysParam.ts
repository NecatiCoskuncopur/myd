'use server';

import { ValidationError } from 'yup';

import { generalMessages, sysParamMessages, UserRole } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import isMongoDuplicateKeyError from '@/lib/isMongoDuplicateKeyError';
import requireRoles from '@/lib/requireRoles';
import { SystemParam } from '@/models';
import updateSysParamSchema from '@/schemas/updateSysParam.schema';

const { UNEXPECTED_ERROR } = generalMessages;
const { KEY, NOT_FOUND, UPDATE } = sysParamMessages;

const updateSysParam = async (data: SysParamTypes.IUpdateSysParamPayload): Promise<ResponseTypes.IActionResponse> => {
  try {
    const authError = await requireRoles([UserRole.ADMIN]);
    if (authError) return authError;

    const validatedData = await updateSysParamSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    await connectMongoDB();

    const { paramId, ...updateData } = validatedData;

    const updatedSysParam = await SystemParam.findByIdAndUpdate(
      paramId,
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedSysParam) {
      return {
        status: 'ERROR',
        message: NOT_FOUND,
      };
    }

    return {
      status: 'OK',
      message: UPDATE.SUCCESS,
    };
  } catch (error) {
    if (isMongoDuplicateKeyError(error)) {
      return {
        status: 'ERROR',
        message: KEY.ALREADY_EXISTS,
      };
    }

    if (error instanceof ValidationError) {
      return {
        status: 'ERROR',
        message: error.errors.join(', '),
      };
    }

    if (error instanceof Error) {
      captureActionError('updateSysParam', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default updateSysParam;
