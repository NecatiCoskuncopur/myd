import PersonIcon from '@mui/icons-material/Person';

import { ShippingTypes } from '@/types/shipping';

import CardHeader from './CardHeader';
import DetailGrid from './DetailGrid';

type ConsigneeSectionProps = {
  consignee?: ShippingTypes.IConsignee;
};

const ConsigneeSection = ({ consignee }: ConsigneeSectionProps) => {
  const rows = [
    { label: 'Ad Soyad', value: consignee?.name },
    { label: 'Firma', value: consignee?.company },
    { label: 'Telefon', value: consignee?.phone },
    { label: 'E-Posta', value: consignee?.email },
    { label: 'Vergi No', value: consignee?.taxId },
    {
      label: 'Adres',
      value: [consignee?.address?.line1, consignee?.address?.line2].filter(Boolean).join(', '),
    },
    { label: 'Şehir', value: consignee?.address?.city },
    { label: 'Eyalet', value: consignee?.address?.state },
    { label: 'Ülke', value: consignee?.address?.country },
    { label: 'Posta Kodu', value: consignee?.address?.postalCode },
  ];

  return (
    <>
      <CardHeader title="Alıcı Bilgisi">
        <PersonIcon />
      </CardHeader>

      <DetailGrid rows={rows} />
    </>
  );
};

export default ConsigneeSection;
