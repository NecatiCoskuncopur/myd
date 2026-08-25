import { ShippingDetail } from '@/components';
import { getCurrentUser } from '@/lib/getCurrentUser';

const ShippingDetailPage = async () => {
  const user = await getCurrentUser();
  const canCreateBarcode = (user?.barcodePermits?.length ?? 0) > 0;

  return <ShippingDetail canCreateBarcode={canCreateBarcode} />;
};

export default ShippingDetailPage;
