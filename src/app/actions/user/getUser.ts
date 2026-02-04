'use server';

import { getCurrentUser } from '@/lib/getCurrentUser';
import messages from '@/lib/messages';
import { User } from '@/models';

export const getUser = async () => {
  const currentUser = await getCurrentUser();

  const user = await User.findById(currentUser?.id).lean();

  if (!user) {
    throw new Error(messages.TK1);
  }

  return user;
};
