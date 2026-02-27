'use server';

import mongoose from 'mongoose';

import { messages } from '@/constants';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { PricingList, User } from '@/models';

const getUserPricingList = async (params: IPaginationParams): Promise<IActionResponse<IUserPricingListData>> => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        status: 'ERROR',
        message: messages.GENERAL.UNAUTHORIZED,
      };
    }

    const page = Math.max(1, params.page ?? 1);
    const limit = Math.max(1, params.limit ?? 5);
    const skip = (page - 1) * limit;

    const user = await User.findById(currentUser.id).select('priceListId').lean<{ priceListId?: mongoose.Types.ObjectId }>();

    if (!user?.priceListId) {
      return {
        status: 'ERROR',
        message: messages.PRICINGLIST.USER_LIST_UNDEFINED,
      };
    }

    const totalAgg = await PricingList.aggregate([
      { $match: { _id: user.priceListId } },
      {
        $project: {
          zoneCount: { $size: '$zone' },
        },
      },
    ]);

    const totalCount = totalAgg[0]?.zoneCount ?? 0;
    const totalPages = totalCount > 0 ? Math.ceil(totalCount / limit) : 1;

    const pricingList = await PricingList.findById(user.priceListId)
      .select({
        name: 1,
        createdAt: 1,
        updatedAt: 1,
        zone: { $slice: [skip, limit] },
      })
      .lean<{
        _id: mongoose.Types.ObjectId;
        name: string;
        zone: {
          number: number;
          than?: number;
          prices: {
            weight?: number;
            price?: number;
          }[];
        }[];
        createdAt: Date;
        updatedAt: Date;
      }>();

    if (!pricingList) {
      return {
        status: 'ERROR',
        message: messages.PRICINGLIST.NOT_FOUND,
      };
    }

    return {
      status: 'OK',
      data: {
        pricingListId: pricingList._id.toString(),
        name: pricingList.name,
        zones: pricingList.zone.map(zone => ({
          number: zone.number,
          than: zone.than,
          prices: zone.prices.map(price => ({
            weight: price.weight,
            price: price.price,
          })),
        })),
        createdAt: pricingList.createdAt,
        updatedAt: pricingList.updatedAt,
        totalCount,
        page,
        limit,
        totalPages,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
      },
    };
  } catch (error) {
    console.error('Get User Pricing List Error:', error);

    return {
      status: 'ERROR',
      message: error instanceof Error ? error.message : messages.GENERAL.UNEXPECTED_ERROR,
    };
  }
};

export default getUserPricingList;
