import React from 'react';

import PersonIcon from '@mui/icons-material/Person';
import { Grid, Typography } from '@mui/material';

import CardHeader from './CardHeader';

type SenderSectionProps = {
  sender: ShippingTypes.ISender | undefined;
};

const SenderSection = ({ sender }: SenderSectionProps) => {
  const rows = [
    { label: 'Ad Soyad', value: sender?.name },
    { label: 'Firma', value: sender?.company },
    { label: 'Telefon', value: sender?.phone },
    { label: 'Email', value: sender?.email },
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

export default SenderSection;
