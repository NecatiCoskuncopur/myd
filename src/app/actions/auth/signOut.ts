'use server';

import { cookies } from 'next/headers';

import messages from '@/constants/messages';

const signOut = async (): Promise<IActionResponse> => {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('token');

    return { status: 'OK' };
  } catch {
    return {
      status: 'ERROR',
      message: messages.AUTH.SIGNOUT_ERROR,
    };
  }
};

export default signOut;
