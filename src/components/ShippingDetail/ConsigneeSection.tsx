import React from 'react';

import PersonIcon from '@mui/icons-material/Person';
import { Grid, Typography } from '@mui/material';

import CardHeader from './CardHeader';

type ConsigneeSectionProps = {
  consignee: ShippingTypes.IConsignee | undefined;
};

const ConsigneeSection = ({ consignee }: ConsigneeSectionProps) => {
  const rows = [
    { label: 'Ad Soyad', value: consignee?.name },
    { label: 'Firma', value: consignee?.company },
    { label: 'Telefon', value: consignee?.phone },
    { label: 'Email', value: consignee?.email },
    { label: 'Vergi No', value: consignee?.taxId },
    {
      label: 'Adrs',
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

export default ConsigneeSection;
