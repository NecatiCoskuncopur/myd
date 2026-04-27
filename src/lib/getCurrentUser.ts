import { cookies } from 'next/headers';

import jwt from 'jsonwebtoken';

import { User } from '@/models';

/**
 * Request cookie'sinde bulunan JWT token'ı doğrular
 * ve ilgili kullanıcıyı veritabanından getirir.
 *
 * İşleyiş:
 * - 'token' isimli cookie okunur
 * - JWT_SECRET ile doğrulama yapılır
 * - Token içindeki sub ile kullanıcı veritabanından sorgulanır
 *
 * @returns
 * - Kullanıcı bulunursa: { id, role, email }
 * - Token yoksa, geçersizse veya kullanıcı bulunamazsa: null
 */

export const getCurrentUser = async (): Promise<UserTypes.ICurrentUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;

  let decoded: UserTypes.JwtPayload;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET as string) as UserTypes.JwtPayload;
  } catch {
    return null;
  }

  const user = await User.findById(decoded.sub).select('_id role email barcodePermits').lean<{
    _id: unknown;
    role: UserTypes.JwtPayload['role'];
    email: string;
    barcodePermits?: string[];
  }>();

  if (!user) return null;

  return {
    id: String(user._id),
    role: user.role,
    email: user.email,
    barcodePermits: user.barcodePermits || [],
  };
};
