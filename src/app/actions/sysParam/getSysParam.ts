'use server';

import { Types } from 'mongoose';

import { generalMessages, sysParamMessages, UserRole } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import serialize from '@/lib/serialize';
import SystemParam from '@/models/SystemParamSchema.model';
const { UNEXPECTED_ERROR } = generalMessages;
const { NOT_FOUND } = sysParamMessages;

const getSysParam = async (paramId: string): Promise<ResponseTypes.IActionResponse<SysParamTypes.ISysParam>> => {
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

    const param = await SystemParam.findById(paramId).lean();

    if (!param) {
      return {
        status: 'ERROR',
        message: NOT_FOUND,
      };
    }

    return {
      status: 'OK',
      data: serialize<SysParamTypes.ISysParam>(param),
    };
  } catch (error) {
    if (error instanceof Error) {
      captureActionError('getSysParam', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default getSysParam;
