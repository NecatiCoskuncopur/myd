'use server';

import { generalMessages } from '@/constants';
import { getCurrentUser } from './getCurrentUser';

/**
 * Mevcut kullanıcının belirtilen rollerden birine sahip olup olmadığını kontrol eder.
 *
 * İşleyiş:
 * - Kullanıcı oturumu getCurrentUser ile alınır
 * - Kullanıcı yoksa veya rolü izin verilen roller arasında değilse hata döner
 *
 * @param allowedRoles - Erişimine izin verilen kullanıcı rolleri
 *
 * @returns
 * - Yetkili değilse: { status: 'ERROR', message: string }
 * - Yetkiliyse: null
 */

const requireRoles = async (allowedRoles: UserTypes.ICurrentUser['role'][]): Promise<{ status: 'ERROR'; message: string } | null> => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      status: 'ERROR',
      message: generalMessages.UNAUTHORIZED,
    };
  }

  if (!allowedRoles.includes(currentUser?.role)) {
    return {
      status: 'ERROR',
      message: generalMessages.UNAUTHORIZED,
    };
  }

  return null;
};

export default requireRoles;
