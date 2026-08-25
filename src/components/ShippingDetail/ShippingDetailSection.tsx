import LocalShippingIcon from '@mui/icons-material/LocalShipping';

import { ShippingTypes } from '@/types/shipping';

import CardHeader from './CardHeader';
import DetailGrid from './DetailGrid';

type ShippingDetailSectionProps = {
  detail?: ShippingTypes.IShippingDetail;
  currency?: 'USD' | 'EUR' | 'GBP';
  numberOfPackage?: number;
  createdAt?: string;
};

const getPayorLabel = (payor?: string) => {
  if (payor === 'SENDER') {
    return 'Gönderici';
  }

  if (payor === 'RECEIVER') {
    return 'Alıcı';
  }

  return undefined;
};

const formatDate = (date?: string) => {
  if (!date) {
    return undefined;
  }

  return new Date(date).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ShippingDetailSection = ({ detail, currency, numberOfPackage, createdAt }: ShippingDetailSectionProps) => {
  const rows = [
    {
      label: 'Gönderim Tipi',
      value: detail?.purpose,
    },
    {
      label: 'Para Birimi',
      value: currency,
    },
    {
      label: 'Kargo Ücreti',
      value: getPayorLabel(detail?.payor?.shipping),
    },
    {
      label: 'Gümrük Masrafı',
      value: getPayorLabel(detail?.payor?.customs),
    },
    {
      label: 'Paket Sayısı',
      value: numberOfPackage,
    },
    {
      label: 'Oluşturulma Tarihi',
      value: formatDate(createdAt),
    },
  ];

  return (
    <>
      <CardHeader title="Gönderi Bilgisi">
        <LocalShippingIcon />
      </CardHeader>

      <DetailGrid rows={rows} />
    </>
  );
};

export default ShippingDetailSection;
