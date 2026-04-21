'use server';

import * as Sentry from '@sentry/nextjs';

import { generalMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { CarrierAccount } from '@/models';

const getCarrierAccounts = async (
  params: CarrierAccountTypes.ICarrierAcccountsParams,
): Promise<ResponseTypes.IActionResponse<CarrierAccountTypes.ICarrierAccountData>> => {
  try {
    const authError = await requireRoles(['ADMIN', 'OPERATOR']);
    if (authError) return authError;

    await connectMongoDB();

    const { page = 1, limit = 5, name, carrier, accountNumber, isActive } = params;

    const match: Record<string, unknown> = {};

    if (name) match.name = { $regex: name, $options: 'i' };
    if (carrier) match.carrier = carrier;
    if (accountNumber) match.accountNumber = { $regex: accountNumber, $options: 'i' };
    if (typeof isActive === 'boolean') match.isActive = isActive;

    const skip = (page - 1) * limit;

    const [carrierAccounts, totalCount] = await Promise.all([
      CarrierAccount.find(match).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      CarrierAccount.countDocuments(match),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      status: 'OK',
      data: {
        carrierAccounts: carrierAccounts as CarrierAccountTypes.ICarrierAccount[],
        totalCount,
        page,
        limit,
        totalPages,
        hasPrevPage,
        hasNextPage,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      Sentry.captureException(error);
    }

    return {
      status: 'ERROR',
      message: generalMessages.UNEXPECTED_ERROR,
    };
  }
};

export default getCarrierAccounts;
