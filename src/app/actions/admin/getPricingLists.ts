'use server';

import type { PaginateModel } from 'mongoose';

import { escapeRegex, generalMessages, UserRole } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import serialize from '@/lib/serialize';
import { PricingList } from '@/models';
import { PricingListTypes } from '@/types/pricingList';

const { UNEXPECTED_ERROR } = generalMessages;

const getPricingLists = async (
  params: PricingListTypes.IPricingListsParams = {},
): Promise<ResponseTypes.IActionResponse<PricingListTypes.IPricingListData>> => {
  try {
    const authError = await requireRoles([UserRole.ADMIN, UserRole.OPERATOR]);
    if (authError) return authError;

    await connectMongoDB();

    const { page = 1, limit = 5, name, listType } = params;

    const currentPage = Math.max(1, page);
    const currentLimit = Math.max(1, limit);

    const query: Record<string, unknown> = {};

    if (name) {
      query.name = {
        $regex: `^${escapeRegex(name.trim())}`,
        $options: 'i',
      };
    }

    if (listType) {
      query.listType = listType;
    }

    const pricingModel = PricingList as typeof PricingList & PaginateModel<PricingListTypes.IPricingList>;

    const result = await pricingModel.paginate(query, {
      page: currentPage,
      limit: currentLimit,
      lean: true,
    });

    return {
      status: 'OK',
      data: {
        pricingLists: serialize<PricingListTypes.IPricingList[]>(result.docs),
        totalCount: result.totalDocs,
        page: result.page ?? currentPage,
        limit: result.limit,
        totalPages: result.totalPages,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      captureActionError('getPricingLists', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default getPricingLists;
