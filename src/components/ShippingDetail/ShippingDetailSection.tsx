import React from 'react';

import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { Grid, Typography } from '@mui/material';

import CardHeader from './CardHeader';

type ShippingDetailSectionProps = {
  detail: ShippingTypes.IShippingDetail | undefined;
  currency?: 'USD' | 'EUR' | 'GBP';
  numberOfPackage: number | undefined;
  createdAt: string | undefined;
};

const ShippingDetailSection = ({ detail, currency, numberOfPackage, createdAt }: ShippingDetailSectionProps) => {
  const rows = [
    { label: 'Gönderim Tipi', value: detail?.purpose },
    { label: 'Para Birimi', value: currency },
    { label: 'Kargo Ücreti', value: detail?.payor?.shipping === 'SENDER' ? 'Gönderici' : 'Alıcı' },
    { label: 'Gümrük Masrafı', value: detail?.payor?.customs === 'SENDER' ? 'Gönderici' : 'Alıcı' },
    { label: 'Paket Sayısı', value: numberOfPackage },
    {
      label: 'Oluşturulma Tarihi',
      value: createdAt
        ? new Date(createdAt).toLocaleString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '-',
    },
  ];

  return (
    <>
      <CardHeader title="Gönderi Bilgisi">
        <LocalShippingIcon />
      </CardHeader>

      <Grid container spacing={2} sx={{ mt: '12px' }}>
        {rows.map(row => (
          <Grid size={{ xs: 12, sm: 6 }} key={row.label}>
            <Typography variant="caption" color="text.primary">
              {row.label}
            </Typography>

            <Typography variant="body1" sx={{ fontSize: 14 }}>
              {row.value || '-'}
            </Typography>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default ShippingDetailSection;
