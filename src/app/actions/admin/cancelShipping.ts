'use server';

import { carrierMessages, generalMessages, shippingMessages, ShippingStatus, UserRole } from '@/constants';
import applyBalanceTransaction from '@/lib/applyBalanceTransaction';
import captureActionError from '@/lib/captureActionError';
import cancelCarrierShipping from '@/lib/carriers/cancelCarrierShipping';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { CarrierAccount, Shipping } from '@/models';
import { AdminTypes } from '@/types/admin';

const { UNEXPECTED_ERROR } = generalMessages;

const cancelShipping = async (params: AdminTypes.ICancelShippingParams): Promise<ResponseTypes.IActionResponse> => {
  try {
    const authError = await requireRoles([UserRole.ADMIN, UserRole.OPERATOR]);

    if (authError) return authError;

    await connectMongoDB();

    const { carrierAccountId, shippingId } = params;

    const shipping = await Shipping.findById(shippingId);

    if (!shipping) {
      return {
        status: 'ERROR',
        message: shippingMessages.NOT_FOUND,
      };
    }

    if (!shipping.carrier?.trackingNumber) {
      return {
        status: 'ERROR',
        message: shippingMessages.NOT_FOUND,
      };
    }

    const carrierAccount = await CarrierAccount.findOne({
      _id: carrierAccountId,
      isActive: true,
    }).lean();

    if (!carrierAccount) {
      return {
        status: 'ERROR',
        message: carrierMessages.NOT_FOUND,
      };
    }

    const { trackingNumber, account: accountNumber, name: firm, amount, insuranceCost, dutiesAndTaxesCost } = shipping.carrier;

    if (!firm || !accountNumber || !trackingNumber) {
      return {
        status: 'ERROR',
        message: shippingMessages.NOT_FOUND,
      };
    }

    await cancelCarrierShipping({
      firm,
      accountNumber,
      trackingNumber,
      credentials: carrierAccount.credentials,
    });

    const refundAmount = Number(((amount ?? 0) + (insuranceCost ?? 0) + (dutiesAndTaxesCost ?? 0)).toFixed(2));

    await applyBalanceTransaction('PAY', shipping.userId.toString(), refundAmount, shipping._id.toString());

    shipping.canceledAt = new Date();
    shipping.status = ShippingStatus.CANCELLED;

    await shipping.save();

    return {
      status: 'OK',
    };
  } catch (error) {
    if (error instanceof Error) {
      captureActionError('cancelShipping', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default cancelShipping;
