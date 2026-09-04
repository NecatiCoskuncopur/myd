'use server';

import { escapeRegex, generalMessages, UserRole } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import serialize from '@/lib/serialize';
import { SystemParam } from '@/models';

const { UNEXPECTED_ERROR } = generalMessages;

const getSysParams = async (params: SysParamTypes.ISysParamParams): Promise<ResponseTypes.IActionResponse<SysParamTypes.ISysParamData>> => {
  try {
    const authError = await requireRoles([UserRole.ADMIN]);
    if (authError) return authError;

    await connectMongoDB();
    const { page = 1, limit = 5, key } = params;

    const currentPage = Math.max(1, page);
    const currentLimit = Math.max(1, limit);

    const createSearchRegex = (value: string) => ({
      $regex: `^${escapeRegex(value.trim())}`,
      $options: 'i',
    });

    const match: Record<string, unknown> = {};
    if (key) {
      match.key = createSearchRegex(key);
    }

    const skip = (currentPage - 1) * currentLimit;
    const [sysParams, totalCount] = await Promise.all([
      SystemParam.find(match).sort({ createdAt: -1 }).skip(skip).limit(currentLimit).lean(),
      SystemParam.countDocuments(match),
    ]);

    const totalPages = Math.ceil(totalCount / currentLimit);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    return {
      status: 'OK',
      data: {
        sysParams: serialize<SysParamTypes.ISysParam[]>(sysParams),
        totalCount,
        page: currentPage,
        limit: currentLimit,
        totalPages,
        hasPrevPage,
        hasNextPage,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      captureActionError('getSysParams', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default getSysParams;
