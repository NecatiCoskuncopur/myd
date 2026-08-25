import getUserPricingList from '@/app/actions/user/getUserPricingList';
import { UserPriceList } from '@/components';

const UserPriceListPage = async () => {
  const response = await getUserPricingList();

  const pricingLists = response.status === 'OK' && response.data ? response.data : {};

  return <UserPriceList pricingLists={pricingLists} />;
};

export default UserPriceListPage;
