'use server';

import { messages } from '@/constants';
import applyBalanceTransaction from '@/lib/applyBalanceTransaction';
import connectMongoDB from '@/lib/db';
import getShippingCost from '@/lib/getShippingCost';
import requireRoles from '@/lib/requireRoles';
import { Shipping, User } from '@/models';

const { GENERAL, SHIPPING } = messages;

const manualLabel = async (shippings: IManualLabelPayload[]): Promise<IActionResponse<null>> => {
  try {
    const authError = await requireRoles(['OPERATOR', 'ADMIN']);
    if (authError) return authError;

    await connectMongoDB();

    for (const shipping of shippings) {
      const ship = await Shipping.findById(shipping.id);
      if (!ship) {
        return {
          status: 'ERROR',
          message: `${SHIPPING.NOT_FOUND}: (${shipping.id})`,
        };
      }

      if (ship.carrier?.trackingNumber) {
        return {
          status: 'ERROR',
          message: `${SHIPPING.ALREADY_LABELED}: (${shipping.id})`,
        };
      }

      const user = await User.findById(ship.userId).lean();
      if (!user) {
        return {
          status: 'ERROR',
          message: `${GENERAL.USER_NOT_FOUND}: (${ship.userId})`,
        };
      }

      const costResult = await getShippingCost(user.priceListId, ship.package.weight, ship.consignee.address.country);

      if (costResult.status === 'ERROR') {
        return {
          status: 'ERROR',
          message: costResult.message,
        };
      }

      ship.carrier = {
        name: shipping.firm,
        account: 'shipentegra',
        trackingNumber: shipping.trackingNumber,
      };

      await ship.save();

      const balanceResult = await applyBalanceTransaction('SPEND', ship.userId, costResult.data, ship._id.toString());

      if (!balanceResult.success) {
        ship.carrier = undefined;
        await ship.save();

        return {
          status: 'ERROR',
          message: balanceResult.message,
        };
      }
    }

    return {
      status: 'OK',
      data: null,
    };
  } catch (error) {
    console.error('Manual Label Error:', error);

    return {
      status: 'ERROR',
      message: GENERAL.UNEXPECTED_ERROR,
    };
  }
};

export default manualLabel;
