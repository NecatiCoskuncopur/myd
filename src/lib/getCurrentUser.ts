import { Types } from 'mongoose';

import { auth } from '@/auth';
import { UserRole } from '@/constants';
import connectMongoDB from '@/lib/db';
import { User } from '@/models';
import { UserTypes } from '@/types/user';

/**
 * Auth.js session'ındaki kullanıcı kimliğiyle
 * güncel kullanıcı bilgilerini veritabanından getirir.
 *
 * @returns
 * - Aktif kullanıcı bulunursa: { id, role, email, barcodePermits }
 * - Session yoksa, kullanıcı bulunamazsa veya kullanıcı pasifse: null
 */
export const getCurrentUser = async (): Promise<UserTypes.ICurrentUser | null> => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId || !Types.ObjectId.isValid(userId)) {
    return null;
  }

  await connectMongoDB();

  const user = await User.findById(userId).select('_id role email barcodePermits isActive').lean<{
    _id: Types.ObjectId;
    role: UserRole;
    email: string;
    barcodePermits?: string[];
    isActive: boolean;
  }>();

  if (!user || !user.isActive) {
    return null;
  }

  return {
    id: user._id.toString(),
    role: user.role,
    email: user.email,
    barcodePermits: user.barcodePermits ?? [],
  };
};
