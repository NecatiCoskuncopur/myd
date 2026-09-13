import { Dispatch, SetStateAction } from 'react';
import { Box } from '@mui/material';

import AdditionalDocumentsSection from '@/components/Shipping/ShippingFormFields/AdditionalDocumentsSection';
import { AdditionalDocumentTypes } from '@/types/additionalDocument';
import { UserTypes } from '@/types/user';

import ConsigneeSection from './ConsigneeSection';
import PackageContentSection from './PackageContentSection';
import PackageDetailSection from './PackageDetailSection';
import SenderSection from './SenderSection';
import ShippingDetailSection from './ShippingDetailSection';

type ShippingFormFieldsProps =
  | {
      mode: 'create';
      user?: UserTypes.UserDto | null;
      setAdditionalDocumentIds: Dispatch<SetStateAction<string[]>>;
    }
  | {
      mode: 'edit';
      user?: UserTypes.UserDto | null;
      shippingId: string;
      initialAdditionalDocuments: AdditionalDocumentTypes.IAdditionalDocument[];
    };

const ShippingFormFields = (props: ShippingFormFieldsProps) => {
  const { mode, user } = props;

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

        {mode === 'create' ? (
          <AdditionalDocumentsSection
            mode="create"
            onDocumentSaved={id => {
              props.setAdditionalDocumentIds(prev => [...prev, id]);
            }}
            onDocumentDeleted={id => {
              props.setAdditionalDocumentIds(prev => prev.filter(documentId => documentId !== id));
            }}
          />
        ) : (
          <AdditionalDocumentsSection mode="edit" shippingId={props.shippingId} initialDocuments={props.initialAdditionalDocuments} />
        )}
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

        {mode === 'create' && user?.role !== 'CUSTOMER' && <SenderSection />}
      </Box>
    </Box>
  );
};

export default ShippingFormFields;
