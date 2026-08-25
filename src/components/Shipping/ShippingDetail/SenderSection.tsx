import PersonIcon from '@mui/icons-material/Person';

import { ShippingTypes } from '@/types/shipping';

import CardHeader from './CardHeader';
import DetailGrid from './DetailGrid';

type SenderSectionProps = {
  sender?: ShippingTypes.ISender;
};

const SenderSection = ({ sender }: SenderSectionProps) => {
  const rows = [
    { label: 'Ad Soyad', value: sender?.name },
    { label: 'Firma', value: sender?.company },
    { label: 'Telefon', value: sender?.phone },
    { label: 'E-Posta', value: sender?.email },
    {
      label: 'Adres',
      value: [sender?.address?.line1, sender?.address?.line2].filter(Boolean).join(', '),
    },
    { label: 'İlçe', value: sender?.address?.district },
    { label: 'Şehir', value: sender?.address?.city },
    { label: 'Posta Kodu', value: sender?.address?.postalCode },
  ];

  return (
    <>
      <CardHeader title="Gönderici Bilgisi">
        <PersonIcon />
      </CardHeader>

      <DetailGrid rows={rows} />
    </>
  );
};

export default SenderSection;
