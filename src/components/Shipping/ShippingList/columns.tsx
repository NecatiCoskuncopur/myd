import { Box, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import moment from 'moment';

import { TrackingStatusEnum, TrackingStatusLabels } from '@/constants';
import { getCountryFlagUrl } from '@/lib/getCountryFlags';
import { ShippingTypes } from '@/types/shipping';

const columns: GridColDef<ShippingTypes.IShipping>[] = [
  {
    field: 'consigneeName',
    headerName: 'Alıcı',
    flex: 1,
    minWidth: 90,
    valueGetter: (_value, row) => row.consignee?.name || '-',
  },
  {
    field: 'senderName',
    headerName: 'Gönderen',
    flex: 1,
    minWidth: 90,
    valueGetter: (_value, row) => row.sender?.name || '-',
  },
  {
    field: 'destination',
    headerName: 'Varış',
    flex: 1,
    minWidth: 120,
    renderCell: ({ row }) => {
      const address = row.consignee?.address;

      if (!address) {
        return '-';
      }

      const countryCode = address.country?.trim();
      const city = address.city;

      if (!countryCode && !city) {
        return '-';
      }

      const flagUrl = countryCode ? getCountryFlagUrl(countryCode) : null;

      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            width: '100%',
            gap: 1,
            overflow: 'hidden',
          }}
        >
          {flagUrl && (
            <Box
              component="img"
              src={flagUrl}
              alt={countryCode ? `${countryCode} bayrağı` : ''}
              sx={{
                width: 20,
                height: 14,
                objectFit: 'cover',
                borderRadius: '2px',
                display: 'block',
                flexShrink: 0,
              }}
            />
          )}

          <Typography variant="body2" noWrap>
            {[countryCode, city].filter(Boolean).join(' / ')}
          </Typography>
        </Box>
      );
    },
  },
  {
    field: 'trackStatus',
    headerName: 'Durum',
    flex: 1,
    minWidth: 90,
    valueFormatter: value => (value ? (TrackingStatusLabels[value as TrackingStatusEnum] ?? '-') : '-'),
  },
  {
    field: 'packageInfo',
    headerName: 'Paket',
    flex: 1,
    minWidth: 100,
    renderCell: ({ row }) => {
      const packageCount = row.package?.numberOfPackage ?? '-';
      const weight = row.package?.weight ?? '-';

      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <Typography variant="caption" sx={{ lineHeight: 1.2 }}>
            <Box
              component="span"
              sx={{
                color: 'text.secondary',
                mr: 0.5,
              }}
            >
              Adet:
            </Box>
            {packageCount}
          </Typography>

          <Typography variant="caption" sx={{ lineHeight: 1.2 }}>
            <Box
              component="span"
              sx={{
                color: 'text.secondary',
                mr: 0.5,
              }}
            >
              Desi/KG:
            </Box>
            {weight}
          </Typography>
        </Box>
      );
    },
  },
  {
    field: 'products',
    headerName: 'İçerik',
    flex: 1.5,
    minWidth: 100,
    valueGetter: (_value, row) => {
      const products = row.content?.products;

      if (!products?.length) {
        return '-';
      }

      return products
        .map(product => product.name)
        .filter(Boolean)
        .join(', ');
    },
  },
  {
    field: 'createdAt',
    headerName: 'Tarih',
    flex: 1,
    minWidth: 100,
    renderCell: ({ value }) => (value ? moment(value).format('DD.MM.YYYY HH:mm') : '-'),
  },
];

export default columns;
