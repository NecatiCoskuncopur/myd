'use client';

import { getCarrierIcon } from '@/constants/carrierIcons';
import { GridColDef } from '@mui/x-data-grid';
import moment from 'moment';
import Link from '@mui/material/Link';
import NextLink from 'next/link';
import { getCarrierTrackingUrl } from '@/constants/carrierTracking';
import { getCountryFlagUrl } from '@/lib/getCountryFlags';
import { Typography, Box } from '@mui/material';

const columns: GridColDef[] = [
  {
    field: 'consigneeName',
    headerName: 'Alıcı',
    flex: 1,
    minWidth: 150,
    valueGetter: (value, row) => row.consignee?.name || '-',
  },
  {
    field: 'senderName',
    headerName: 'Gönderen',
    flex: 1,
    minWidth: 150,
    valueGetter: (value, row) => row.sender?.name || '-',
  },
  {
    field: 'destination',
    headerName: 'Varış Bölgesi',
    flex: 1,
    minWidth: 200,
    renderCell: params => {
      const address = params.row.consignee?.address;
      if (!address) return '-';

      const countryCode = address.country?.trim();
      const city = address.city;

      if (!countryCode && !city) return '-';

      const flagUrl = getCountryFlagUrl(countryCode);

      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {flagUrl && (
            <img
              src={flagUrl}
              alt={countryCode}
              style={{
                width: '20px',
                height: '14px',
                objectFit: 'cover',
                borderRadius: '2px',
                display: 'block',
              }}
            />
          )}
          <span>{[countryCode, city].filter(Boolean).join(' / ')}</span>
        </div>
      );
    },
  },
  {
    field: 'trackingNumber',
    headerName: 'Takip No',
    flex: 1,
    minWidth: 170,
    renderCell: params => {
      const carrierName = params.row.carrier?.name;
      const trackingNo = params.row.carrier?.trackingNumber;

      if (!trackingNo) return '-';

      const { url, hasLink } = getCarrierTrackingUrl(carrierName, trackingNo);
      const { icon } = getCarrierIcon(carrierName);

      if (hasLink && url) {
        return (
          <Link
            component={NextLink}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
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
            {icon}
            <Typography
              component="span"
              variant="body2"
              noWrap
              sx={{
                fontWeight: 500,
                fontSize: '0.875rem',
              }}
            >
              {trackingNo}
            </Typography>
          </Link>
        );
      }

      return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
          {icon && <Box sx={{ display: 'inline-flex', '& svg, & img': { width: 18, height: 18 } }}>{icon}</Box>}
          <Typography variant="body2" color="text.secondary" noWrap>
            {trackingNo}
          </Typography>
        </Box>
      );
    },
  },
  {
    field: 'packageInfo',
    headerName: 'Paket',
    flex: 1,
    minWidth: 160,
    renderCell: params => {
      const count = params.row.package?.numberOfPackage ?? '-';
      const weight = params.row.package?.weight ?? '-';

      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <Typography variant="body2" sx={{ color: 'text.primary' }}>
            <Box component="span" sx={{ color: 'text.secondary', lineHeight: 1.3, marginRight: 1 }}>
              Paket Sayısı
            </Box>
            {count}
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.primary' }}>
            <Box component="span" sx={{ color: 'text.secondary', lineHeight: 1.3, marginRight: 1 }}>
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
    valueGetter: (value, row) => {
      const products = row.content?.products;
      if (!products || products.length === 0) return '-';

      return products
        .map((p: ShippingTypes.IProduct) => p.name)
        .filter(Boolean)
        .join(', ');
    },
  },
  {
    field: 'createdAt',
    headerName: 'Oluşturulma Tarihi',
    flex: 1,
    minWidth: 160,
    renderCell: params => (params.value ? moment(params.value).format('DD.MM.YYYY HH:mm') : '-'),
  },
];

export default columns;
