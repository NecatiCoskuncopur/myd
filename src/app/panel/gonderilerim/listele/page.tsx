import getUserPermittedAccounts from '@/app/actions/user/getUserPermittedAccounts';
import getUserPricingLists from '@/app/actions/user/getUserPricingList';
import { ShippingList } from '@/components';
import { getCurrentUser } from '@/lib/getCurrentUser';

const ShippingListPage = async () => {
  const user = await getCurrentUser();

  const canCreateBarcode = (user?.barcodePermits?.length ?? 0) > 0;

  if (!canCreateBarcode) {
    return <ShippingList canCreateBarcode={false} accounts={[]} pricingLists={{}} />;
  }

  const [accountsResponse, pricingListsResponse] = await Promise.all([getUserPermittedAccounts(), getUserPricingLists()]);

  return (
    <ShippingList
      canCreateBarcode
      accounts={accountsResponse.status === 'OK' && accountsResponse.data ? accountsResponse.data : []}
      pricingLists={pricingListsResponse.status === 'OK' && pricingListsResponse.data ? pricingListsResponse.data : {}}
    />
  );
};

export default ShippingListPage;
