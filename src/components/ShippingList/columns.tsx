'use client';

import { GridColDef } from '@mui/x-data-grid';
import moment from 'moment';

const columns: GridColDef[] = [
  {
    field: 'consigneeName',
    headerName: 'Alıcı',
    flex: 1,
    minWidth: 150,
    valueGetter: (value, row) => row.consignee?.name || '-',
  },
  {
    field: 'destination',
    headerName: 'Varış Bölgesi',
    flex: 1,
    minWidth: 250,
    renderCell: params => {
      const address = params.row.consignee?.address;
      if (!address) return '-';

      const parts = [address.country, address.city].filter(Boolean);
      return parts.length > 0 ? parts.join(' / ') : '-';
    },
  },
  {
    field: 'trackingNumber',
    headerName: 'Takip No',
    flex: 1,
    minWidth: 150,
    valueGetter: (value, row) => row.carrier?.trackingNumber || '-',
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
