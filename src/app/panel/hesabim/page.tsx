import getUser from '@/app/actions/user/getUser';
import { Account } from '@/components';

const AccountPage = async () => {
  const result = await getUser();

  return <Account user={result.data} />;
};

export default AccountPage;
