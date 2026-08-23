'use server';

import { escapeRegex, generalMessages, UserRole } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import serialize from '@/lib/serialize';
import { CarrierAccount } from '@/models';
import { CarrierAccountTypes } from '@/types/carrierAccount';

const getCarrierAccounts = async (
  params: CarrierAccountTypes.ICarrierAccountsParams,
): Promise<ResponseTypes.IActionResponse<CarrierAccountTypes.ICarrierAccountData>> => {
  try {
    const authError = await requireRoles([UserRole.ADMIN, UserRole.OPERATOR]);
    if (authError) return authError;

    await connectMongoDB();

    const { page = 1, limit = 5, name, accountType, displayName, carrier, accountNumber, isActive } = params;

    const currentPage = Math.max(1, page);
    const currentLimit = Math.max(1, limit);

    const createSearchRegex = (value: string) => ({
      $regex: `^${escapeRegex(value.trim())}`,
      $options: 'i',
    });

    const match: Record<string, unknown> = {};

    if (name) match.name = createSearchRegex(name);
    if (displayName) match.displayName = createSearchRegex(displayName);
    if (carrier) match.carrier = carrier;
    if (accountType) match.accountType = accountType;
    if (accountNumber) match.accountNumber = createSearchRegex(accountNumber);
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
        carrierAccounts: serialize<CarrierAccountTypes.ICarrierAccount[]>(carrierAccounts),
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
      captureActionError('getCarrierAccounts', error);
    }

    return {
      status: 'ERROR',
      message: generalMessages.UNEXPECTED_ERROR,
    };
  }
};

export default getCarrierAccounts;
