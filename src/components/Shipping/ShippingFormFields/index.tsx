import { Dispatch, SetStateAction } from 'react';
import { usePathname } from 'next/navigation';
import { Box } from '@mui/material';

import UploadFileSection from '@/components/Shipping/ShippingFormFields/UploadFileSection';
import { UserTypes } from '@/types/user';

import ConsigneeSection from './ConsigneeSection';
import PackageContentSection from './PackageContentSection';
import PackageDetailSection from './PackageDetailSection';
import SenderSection from './SenderSection';
import ShippingDetailSection from './ShippingDetailSection';

type ShippingFormFieldsProps = {
  user?: UserTypes.UserDto | null;
  additionalDocument: File | null;
  setAdditionalDocument: Dispatch<SetStateAction<File | null>>;
};

const ShippingFormFields = ({ user, additionalDocument, setAdditionalDocument }: ShippingFormFieldsProps) => {
  const pathname = usePathname();
  const isEditMode = pathname.includes('duzenle');

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2,
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
        <UploadFileSection additionalDocument={additionalDocument} setAdditionalDocument={setAdditionalDocument} />
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
        <PackageContentSection />

        <PackageDetailSection />

        {user?.role !== 'CUSTOMER' && !isEditMode && <SenderSection />}
      </Box>
    </Box>
  );
};

export default ShippingFormFields;
