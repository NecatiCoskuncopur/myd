'use server';

import { Types } from 'mongoose';

import { generalMessages, sysParamMessages, UserRole } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { SystemParam } from '@/models';

const { UNEXPECTED_ERROR } = generalMessages;
const { DELETE, NOT_FOUND } = sysParamMessages;

const deleteSysParam = async (paramId: string): Promise<ResponseTypes.IActionResponse> => {
  try {
    const authError = await requireRoles([UserRole.ADMIN]);
    if (authError) return authError;

    if (!Types.ObjectId.isValid(paramId)) {
      return {
        status: 'ERROR',
        message: NOT_FOUND,
      };
    }

    await connectMongoDB();

    const deletedSysParam = await SystemParam.findByIdAndDelete(paramId);

    if (!deletedSysParam) {
      return {
        status: 'ERROR',
        message: NOT_FOUND,
      };
    }

    return {
      status: 'OK',
      message: DELETE.SUCCESS,
    };
  } catch (error) {
    if (error instanceof Error) {
      captureActionError('deleteSysParam', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default deleteSysParam;
