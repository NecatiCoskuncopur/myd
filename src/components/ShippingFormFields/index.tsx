import { usePathname } from 'next/navigation';
import { Box, useTheme } from '@mui/material';

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
  const theme = useTheme();
  const isEditMode = pathname.includes('duzenle');

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        border: `1px solid ${theme.palette.dashboard.border}`,
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          flex: 1,
          width: { xs: '100%', md: '50%' },
          borderRight: { md: `1px solid ${theme.palette.dashboard.border}` },
        }}
      >
        <ConsigneeSection />
        <ShippingDetailSection />
      </Box>
      <Box
        sx={{
          flex: 1,
          width: { xs: '100%', md: '50%' },
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
