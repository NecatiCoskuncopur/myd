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
    minWidth: 150,
    valueGetter: (_value, row) => row.consignee?.name || '-',
  },
  {
    field: 'senderName',
    headerName: 'Gönderen',
    flex: 1,
    minWidth: 150,
    valueGetter: (_value, row) => row.sender?.name || '-',
  },
  {
    field: 'destination',
    headerName: 'Varış Bölgesi',
    flex: 1,
    minWidth: 200,
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
    minWidth: 120,
    valueFormatter: value => (value ? (TrackingStatusLabels[value as TrackingStatusEnum] ?? '-') : '-'),
  },
  {
    field: 'packageInfo',
    headerName: 'Paket',
    flex: 1,
    minWidth: 160,
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
          <Typography variant="body2">
            <Box
              component="span"
              sx={{
                color: 'text.secondary',
                lineHeight: 1.3,
                mr: 1,
              }}
            >
              Paket Sayısı
            </Box>

            {packageCount}
          </Typography>

          <Typography variant="body2">
            <Box
              component="span"
              sx={{
                color: 'text.secondary',
                lineHeight: 1.3,
                mr: 1,
              }}
            >
              Desi / KG
            </Box>

            {weight}
          </Typography>
        </Box>
      );
    },
  },
  {
    field: 'products',
    headerName: 'İçerik (Ürünler)',
    flex: 1,
    minWidth: 180,
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
    headerName: 'Oluşturulma Tarihi',
    flex: 1,
    minWidth: 160,
    renderCell: ({ value }) => (value ? moment(value).format('DD.MM.YYYY HH:mm') : '-'),
  },
];

export default columns;
