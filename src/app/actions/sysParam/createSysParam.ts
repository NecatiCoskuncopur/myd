'use server';

import { ValidationError } from 'yup';

import { generalMessages, sysParamMessages, UserRole } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import isMongoDuplicateKeyError from '@/lib/isMongoDuplicateKeyError';
import requireRoles from '@/lib/requireRoles';
import SystemParam from '@/models/SystemParamSchema.model';
import createSysParamSchema from '@/schemas/createSysParam.schema';

const { UNEXPECTED_ERROR } = generalMessages;
const { CREATE, KEY } = sysParamMessages;

const createSysParam = async (data: SysParamTypes.ICreateSysParamPayload): Promise<ResponseTypes.IActionResponse> => {
  try {
    const authError = await requireRoles([UserRole.ADMIN]);
    if (authError) return authError;

    const validatedData = await createSysParamSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    await connectMongoDB();

    await SystemParam.create(validatedData);

    return {
      status: 'OK',
      message: CREATE.SUCCESS,
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
      captureActionError('createSysParam', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default createSysParam;
