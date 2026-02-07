import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/getCurrentUser';

const Home = async () => {
  const currentUser = await getCurrentUser();

  if (currentUser) {
    redirect('/panel');
  } else {
    redirect('/kullanici/giris');
  }
};

export default Home;
