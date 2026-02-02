'use server';

import { cookies } from 'next/headers';

const signOut = async () => {
  const cookieStore = await cookies();
  cookieStore.delete('token');
};

export default signOut;
