'use server';

import * as Sentry from '@sentry/nextjs';

import { generalMessages, pricingListMessages } from '@/constants';
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
    if (!currentUser) {
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
      _id: {
        $in: priceListIds,
      },
    }).lean();

    if (!pricingListDocs.length) {
      return {
        status: 'ERROR',
        message: NOT_FOUND,
      };
    }

    const pricingLists: Record<string, PricingListTypes.IPricingList> = {};

    for (const userPriceList of user.priceLists) {
      const pricingListDoc = pricingListDocs.find(pricingList => pricingList._id.toString() === userPriceList.priceListId.toString());

      if (!pricingListDoc) {
        continue;
      }

      pricingLists[userPriceList.serviceType] = {
        _id: pricingListDoc._id.toString(),
        name: pricingListDoc.name,
        listType: pricingListDoc.listType,

        zone: pricingListDoc.zone.map((z: PricingListTypes.IZone) => ({
          number: z.number,

          prices: z.prices.map((p: PricingListTypes.IPrice) => ({
            weight: p.weight ?? 0,
            price: p.price ?? 0,
          })),

          than: z.than,
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
      Sentry.withScope(scope => {
        scope.setTag('action', 'getUserPricingLists');

        scope.captureException(error);
      });
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default getUserPricingLists;
