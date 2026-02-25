import { cookies } from 'next/headers';

import jwt from 'jsonwebtoken';

import { User } from '@/models';

export type UserRole = 'CUSTOMER' | 'OPERATOR' | 'ADMIN';

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

interface CurrentUser {
  id: string;
  role: UserRole;
  email: string;
}

/**
 * Cookie'deki JWT token'ı doğrular ve kullanıcıyı veritabanından getirir.
 *
 * @returns Kullanıcı bilgisi veya null (token yok / geçersiz / kullanıcı bulunamadı)
 */

export const getCurrentUser = async (): Promise<CurrentUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;

  let decoded: JwtPayload;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
  } catch {
    return null;
  }

  const user = await User.findById(decoded.userId).select('_id role email').lean<{
    _id: unknown;
    role: UserRole;
    email: string;
  }>();

  if (!user) return null;

  return {
    id: String(user._id),
    role: user.role,
    email: user.email,
  };
};
