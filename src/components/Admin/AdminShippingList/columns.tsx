'use client';

import NextLink from 'next/link';
import PublishedWithChangesOutlinedIcon from '@mui/icons-material/PublishedWithChangesOutlined';
import { Box, Tooltip, Typography } from '@mui/material';
import Link from '@mui/material/Link';
import { GridColDef } from '@mui/x-data-grid';
import moment from 'moment';

import { TrackingStatusEnum, TrackingStatusLabels } from '@/constants';
import getCarrierIcon from '@/lib/getCarrierIcon';
import getCarrierTrackingUrl from '@/lib/getCarrierTrackingUrl';
import { getCountryFlagUrl } from '@/lib/getCountryFlags';
import { ShippingTypes } from '@/types/shipping';

const columns: GridColDef[] = [
  {
    field: 'consigneeName',
    headerName: 'Alıcı',
    flex: 1,
    minWidth: 100,
    valueGetter: (value, row) => row.consignee?.name || '-',
  },
  {
    field: 'senderName',
    headerName: 'Gönderen',
    flex: 1,
    minWidth: 100,
    valueGetter: (value, row) => row.sender?.name || '-',
  },
  {
    field: 'destination',
    headerName: 'Varış Bölgesi',
    flex: 1,
    minWidth: 150,
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
      const icon = getCarrierIcon(carrierName);

      const content = (
        <>
          {icon && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,

                '& svg': {
                  width: 20,
                  height: 20,
                  display: 'block',
                },

                '& img': {
                  width: 20,
                  height: 20,
                  display: 'block',
                  objectFit: 'contain',
                },
              }}
            >
              {icon}
            </Box>
          )}

          <Typography
            component="span"
            variant="body2"
            noWrap
            sx={{
              fontWeight: 500,
              fontSize: '0.875rem',
              lineHeight: 1,
            }}
          >
            {trackingNo}
          </Typography>
        </>
      );

      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            minWidth: 0,
          }}
        >
          {hasLink && url ? (
            <Link
              component={NextLink}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                minWidth: 0,
                color: 'primary.main',
                fontWeight: 500,
                textDecoration: 'none',

                '&:hover': {
                  textDecoration: 'underline',
                  color: 'primary.dark',
                },
              }}
            >
              {content}
            </Link>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                minWidth: 0,
                color: 'text.secondary',
              }}
            >
              {content}
            </Box>
          )}
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
    minWidth: 180,
    renderCell: params => {
      const count = params.row.package?.numberOfPackage ?? '-';
      const weight = params.row.package?.weight ?? '-';
      const isUpdated = params.row.packageDimensionsUpdated;

      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            height: '100%',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.primary' }}>
              <Box
                component="span"
                sx={{
                  color: 'text.secondary',
                  lineHeight: 1.3,
                  marginRight: 1,
                }}
              >
                Paket Sayısı
              </Box>
              {count}
            </Typography>

            <Typography variant="body2" sx={{ color: 'text.primary' }}>
              <Box
                component="span"
                sx={{
                  color: 'text.secondary',
                  lineHeight: 1.3,
                  marginRight: 1,
                }}
              >
                Desi / KG
              </Box>
              {weight}
            </Typography>
          </Box>

          {isUpdated && (
            <Tooltip title="Paket ölçüleri güncellendi" arrow>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: 'error.main',
                  color: 'warning.contrastText',
                  flexShrink: 0,
                }}
              >
                <PublishedWithChangesOutlinedIcon sx={{ fontSize: 16 }} />
              </Box>
            </Tooltip>
          )}
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
