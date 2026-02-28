'use server';

import { messages } from '@/constants';
import { getCurrentUser, UserRole } from './getCurrentUser';

/**
 * Kullanıcının belirtilen rollere sahip olup olmadığını kontrol eder.
 *
 * @param allowedRoles - İzin verilen kullanıcı rolleri
 * @returns Kullanıcı yetkili değilse hata objesi, yetkiliyse null döner
 */

const requireRoles = async (allowedRoles: UserRole[]): Promise<{ status: 'ERROR'; message: string } | null> => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      status: 'ERROR',
      message: messages.GENERAL.UNAUTHORIZED,
    };
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return {
      status: 'ERROR',
      message: messages.GENERAL.UNAUTHORIZED,
    };
  }

  return null;
};

export default requireRoles;
