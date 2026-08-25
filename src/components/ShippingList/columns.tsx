import { Box, Link, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import moment from 'moment';

import getCarrierTrackingUrl from '@/lib/getCarrierTrackingUrl';
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
    field: 'trackingNumber',
    headerName: 'Takip No',
    flex: 1,
    minWidth: 170,
    renderCell: ({ row }) => {
      const carrierName = row.carrier?.name;
      const trackingNumber = row.carrier?.trackingNumber;

      if (!trackingNumber) {
        return '-';
      }

      if (!carrierName) {
        return (
          <Typography variant="body2" color="text.secondary" noWrap>
            {trackingNumber}
          </Typography>
        );
      }

      const { url, hasLink } = getCarrierTrackingUrl(carrierName, trackingNumber);

      if (hasLink && url) {
        return (
          <Link
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              color: 'primary.main',
              fontWeight: 500,
              textDecoration: 'none',
              overflow: 'hidden',
              '&:hover': {
                textDecoration: 'underline',
                color: 'primary.dark',
              },
            }}
          >
            <Typography
              component="span"
              variant="body2"
              noWrap
              sx={{
                fontWeight: 500,
                fontSize: '0.875rem',
              }}
            >
              {trackingNumber}
            </Typography>
          </Link>
        );
      }

      return (
        <Typography variant="body2" color="text.secondary" noWrap>
          {trackingNumber}
        </Typography>
      );
    },
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
