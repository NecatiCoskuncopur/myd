'use server';

import * as Sentry from '@sentry/nextjs';

import { generalMessages, UserRole } from '@/constants';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { CarrierAccount } from '@/models';
import { CarrierAccountTypes } from '@/types/carrierAccount';

const getCarrierAccounts = async (
  params: CarrierAccountTypes.ICarrierAccountsParams,
): Promise<ResponseTypes.IActionResponse<CarrierAccountTypes.ICarrierAccountData>> => {
  try {
    const authError = await requireRoles([UserRole.ADMIN, UserRole.OPERATOR]);
    if (authError) return authError;

    await connectMongoDB();

    const { page = 1, limit = 5, name, displayName, carrier, accountNumber, isActive } = params;

    const currentPage = Math.max(1, page);
    const currentLimit = Math.max(1, limit);

    const match: Record<string, unknown> = {};

    if (name) match.name = { $regex: name, $options: 'i' };
    if (displayName) match.displayName = { $regex: displayName, $options: 'i' };
    if (carrier) match.carrier = carrier;
    if (accountNumber) match.accountNumber = { $regex: accountNumber, $options: 'i' };
    if (typeof isActive === 'boolean') match.isActive = isActive;

    const skip = (currentPage - 1) * currentLimit;

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
        carrierAccounts: JSON.parse(JSON.stringify(carrierAccounts)),
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
      Sentry.withScope(scope => {
        scope.setTag('action', 'getCarrierAccounts');
        scope.captureException(error);
      });
    }

    return {
      status: 'ERROR',
      message: generalMessages.UNEXPECTED_ERROR,
    };
  }
};

export default getCarrierAccounts;
