'use server';

import { carrierMessages, generalMessages, shippingMessages, ShippingStatus, UserRole } from '@/constants';
import applyBalanceTransaction from '@/lib/applyBalanceTransaction';
import captureActionError from '@/lib/captureActionError';
import cancelCarrierShipping from '@/lib/carriers/cancelCarrierShipping';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { CarrierAccount, Shipping, Transaction } from '@/models';
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

    const { trackingNumber, account: accountNumber, name: firm, carrierShipmentId } = shipping.carrier;

    if (!firm || !accountNumber || !trackingNumber) {
      return {
        status: 'ERROR',
        message: shippingMessages.NOT_FOUND,
      };
    }

    try {
      await cancelCarrierShipping({
        firm,
        accountNumber,
        trackingNumber,
        credentials: carrierAccount.credentials,
        carrierShipmentId: carrierShipmentId ?? undefined,
      });
    } catch (error) {
      if (error instanceof Error) {
        captureActionError(`cancelShipping:${firm}`, error);

        return {
          status: 'ERROR',
          message: error.message || UNEXPECTED_ERROR,
        };
      }

      return {
        status: 'ERROR',
        message: UNEXPECTED_ERROR,
      };
    }

    const originalTransaction = await Transaction.findOne({
      shippingId: shipping._id,
      transactionType: 'SPEND',
    }).lean();

    let refundAmount = 0;

    if (originalTransaction) {
      refundAmount = originalTransaction.amount;
    } else {
      const carrier = shipping.carrier;

      const amount = carrier?.amount ?? 0;
      const insuranceCost = carrier?.insuranceCost ?? 0;
      const dutiesAndTaxesCost = carrier?.dutiesAndTaxesCost ?? 0;
      const longSideSurchargeCost = carrier?.longSideSurchargeCost ?? 0;
      const serviceFee = carrier?.serviceFee ?? 0;

      const totalCarrierCost = amount + insuranceCost + dutiesAndTaxesCost + longSideSurchargeCost + serviceFee;

      refundAmount = Number(totalCarrierCost.toFixed(2));
    }

    if (refundAmount > 0) {
      await applyBalanceTransaction('PAY', shipping.userId.toString(), refundAmount, shipping._id.toString(), `Kargo İptal İadesi (#${trackingNumber})`);
    }

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
