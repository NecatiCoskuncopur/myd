import LocalShippingIcon from '@mui/icons-material/LocalShipping';

import { ShippingTypes } from '@/types/shipping';

import CardHeader from './CardHeader';
import DetailGrid from './DetailGrid';

type ShippingDetailSectionProps = {
  detail?: ShippingTypes.IShippingDetail;
  numberOfPackage?: number;
  createdAt?: string;
  content?: ShippingTypes.IShippingContent;
};

const getPayorLabel = (payor?: string) => {
  if (payor === 'SENDER') {
    return 'Gönderici';
  }

  if (payor === 'CONSIGNEE') {
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

const ShippingDetailSection = ({ detail, numberOfPackage, createdAt, content }: ShippingDetailSectionProps) => {
  const rows = [
    {
      label: 'Gönderim Tipi',
      value: detail?.purpose,
    },
    {
      label: 'Para Birimi',
      value: content?.currency,
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
    {
      label: 'Sigorta',
      value: content?.insurance ? `Uygulandı (${content.insuranceAmount} ${content.currency})` : 'Uygulanmadı',
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
