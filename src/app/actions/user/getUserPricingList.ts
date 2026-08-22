'use server';

import { generalMessages, pricingListMessages } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { PricingList, User } from '@/models';
import { PricingListTypes } from '@/types/pricingList';

const { NOT_FOUND, USER_LIST_UNDEFINED } = pricingListMessages;
const { UNAUTHORIZED, UNEXPECTED_ERROR } = generalMessages;

const getUserPricingLists = async (): Promise<ResponseTypes.IActionResponse<Record<string, PricingListTypes.IPricingList>>> => {
  try {
    await connectMongoDB();

    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return {
        status: 'ERROR',
        message: UNAUTHORIZED,
      };
    }

    const user = await User.findById(currentUser.id).select('priceLists').lean();

    if (!user?.priceLists?.length) {
      return {
        status: 'ERROR',
        message: USER_LIST_UNDEFINED,
      };
    }

    const priceListIds = user.priceLists.map(priceList => priceList.priceListId);

    const pricingListDocs = await PricingList.find({
      _id: { $in: priceListIds },
    })
      .select('name listType zone createdAt updatedAt')
      .lean();

    if (!pricingListDocs.length) {
      return {
        status: 'ERROR',
        message: NOT_FOUND,
      };
    }

    const pricingListMap = new Map(pricingListDocs.map(pricingList => [pricingList._id.toString(), pricingList]));
    const pricingLists: Record<string, PricingListTypes.IPricingList> = {};

    for (const userPriceList of user.priceLists) {
      const pricingListDoc = pricingListMap.get(userPriceList.priceListId.toString());

      if (!pricingListDoc) {
        continue;
      }

      pricingLists[userPriceList.serviceType] = {
        _id: pricingListDoc._id.toString(),
        name: pricingListDoc.name,
        listType: pricingListDoc.listType,
        zone: pricingListDoc.zone.map(zone => ({
          number: zone.number,
          prices: zone.prices.map(price => ({
            weight: price.weight ?? 0,
            price: price.price ?? 0,
          })),
          than: zone.than,
        })),
        createdAt: new Date(pricingListDoc.createdAt).toISOString(),
        updatedAt: new Date(pricingListDoc.updatedAt).toISOString(),
      };
    }

    if (Object.keys(pricingLists).length === 0) {
      return {
        status: 'ERROR',
        message: NOT_FOUND,
      };
    }

    return {
      status: 'OK',
      data: pricingLists,
    };
  } catch (error) {
    if (error instanceof Error) {
      captureActionError('getUserPricingLists', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default getUserPricingLists;
