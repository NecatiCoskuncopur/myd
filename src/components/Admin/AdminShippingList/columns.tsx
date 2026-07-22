'use client';

import { GridColDef } from '@mui/x-data-grid';
import moment from 'moment';
import Link from 'next/link';
import { getCarrierTrackingUrl } from '@/constants/carrierTracking';
import { getCountryFlagUrl } from '@/lib/getCountryFlags';

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
    minWidth: 250,
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
    minWidth: 150,
    renderCell: params => {
      const carrierName = params.row.carrier?.name;
      const trackingNo = params.row.carrier?.trackingNumber;

      if (!trackingNo) return '-';

      const { url, hasLink } = getCarrierTrackingUrl(carrierName, trackingNo);

      if (hasLink && url) {
        return (
          <Link
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#1976d2',
              textDecoration: 'underline',
              fontWeight: 500,
            }}
          >
            {trackingNo}
          </Link>
        );
      }

      return <span>{trackingNo}</span>;
    },
  },
  {
    field: 'numberOfPackage',
    headerName: 'Paket Sayısı',
    flex: 1,
    minWidth: 150,
    valueGetter: (value, row) => row.package?.numberOfPackage || '-',
  },
  {
    field: 'products',
    headerName: 'İçerik (Ürünler)',
    flex: 1,
    minWidth: 200,
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
    minWidth: 180,
    renderCell: params => (params.value ? moment(params.value).format('DD.MM.YYYY HH:mm') : '-'),
  },
];

export default columns;
