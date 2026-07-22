import { usePathname } from 'next/navigation';
import { Box } from '@mui/material';

import ConsigneeSection from './ConsigneeSection';
import PackageContentSection from './PackageContentSection';
import PackageDetailSection from './PackageDetailSection';
import SenderSection from './SenderSection';
import ShippingDetailSection from './ShippingDetailSection';
import { UserTypes } from '@/types/user';

type ShippingFormFieldsProps = {
  user?: UserTypes.ICleanUser | null;
};

const ShippingFormFields = ({ user }: ShippingFormFieldsProps) => {
  const pathname = usePathname();
  const isEditMode = pathname.includes('duzenle');

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2, // Sol ve Sağ ana sütunlar arası boşluk
      }}
    >
      <Box
        sx={{
          flex: 1,
          width: { xs: '100%', md: '50%' },
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <ConsigneeSection />
        <ShippingDetailSection />
      </Box>

      <Box
        sx={{
          flex: 1,
          width: { xs: '100%', md: '50%' },
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {user?.role !== 'CUSTOMER' && !isEditMode && <SenderSection />}
        <PackageContentSection />
        <PackageDetailSection />
      </Box>
    </Box>
  );
};

export default ShippingFormFields;
