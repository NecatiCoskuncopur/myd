'use server';

import * as Sentry from '@sentry/nextjs';
import type { PaginateModel } from 'mongoose';

import { messages } from '@/constants';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { PricingList } from '@/models';

const getPricingLists = async (params: IPricingListsParams = {}): Promise<IActionResponse<IPricingListData>> => {
  try {
    const authError = await requireRoles(['OPERATOR', 'ADMIN']);
    if (authError) return authError;

    await connectMongoDB();

    const { page = 1, limit = 5, name } = params;

    const safePage = Math.max(page, 1);
    const safeLimit = Math.max(limit, 1);

    const query = {
      ...(name && {
        name: { $regex: name, $options: 'i' },
      }),
    };

    const pricingModel = PricingList as typeof PricingList & PaginateModel<IPricingList>;

    const result = await pricingModel.paginate(query, {
      page: safePage,
      limit: safeLimit,
      lean: true,
    });

    const pricingLists = result.docs.map((item: IPricingList) => ({
      _id: item._id.toString(),
      name: item.name,
      zone: item.zone.map(z => ({
        number: z.number,
        prices: z.prices.map(p => ({ weight: p.weight, price: p.price })),
        than: z.than,
      })),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    return {
      status: 'OK',
      data: {
        pricingLists,
        totalCount: result.totalDocs,
        page: result.page ?? safePage,
        limit: result.limit,
        totalPages: result.totalPages,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      Sentry.captureException(error);
    }

    return {
      status: 'ERROR',
      message: messages.GENERAL.UNEXPECTED_ERROR,
    };
  }
};

export default getPricingLists;
