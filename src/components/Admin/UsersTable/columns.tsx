'use client';

import CancelIcon from '@mui/icons-material/Cancel';
import { Chip } from '@mui/material';
import { GridCheckCircleIcon, GridColDef } from '@mui/x-data-grid';
import moment from 'moment';

const columns: GridColDef[] = [
  { field: 'firstName', headerName: 'Ad', flex: 1, minWidth: 100 },
  { field: 'lastName', headerName: 'Soyad', flex: 1, minWidth: 100 },
  { field: 'company', headerName: 'Firma', flex: 1, minWidth: 100 },
  { field: 'phone', headerName: 'Telefon', flex: 1, minWidth: 100 },
  { field: 'email', headerName: 'E-Posta', flex: 1, minWidth: 100 },
  {
    field: 'address',
    headerName: 'Adres',
    flex: 1,
    minWidth: 250,
    renderCell: params => {
      const address = params.row.address;
      if (!address) return '-';
      return `${address.line1 ?? ''} ${address.line2 ?? ''}, ${address.district ?? ''}/${address.city ?? ''} ${address.postalCode ?? ''}`;
    },
  },
  {
    field: 'role',
    headerName: 'Rol',
    flex: 1,
    minWidth: 130,
    renderCell: params => {
      switch (params.value) {
        case 'ADMIN':
          return <Chip label="Yönetici" color="error" size="small" />;
        case 'OPERATOR':
          return <Chip label="Operatör" color="secondary" size="small" />;
        case 'CUSTOMER':
          return <Chip label="Müşteri" size="small" />;
        default:
          return <Chip label="Bilinmiyor" size="small" />;
      }
    },
  },
  {
    field: 'balance',
    headerName: 'Bakiye',
    flex: 1,
    minWidth: 130,
    sortable: true,
    renderCell: params => {
      const balance = params.row.balance;
      if (!balance) return 0;
      return `${balance}`;
    },
  },
  { field: 'priceList', headerName: 'Fiyat Listesi', flex: 1, minWidth: 100 },
  {
    field: 'isActive',
    headerName: 'Aktif',
    flex: 1,
    minWidth: 50,
    renderCell: params => (params.value ? <GridCheckCircleIcon color="success" /> : <CancelIcon color="error" />),
  },
  {
    field: 'createdAt',
    headerName: 'Oluşturulma Tarihi',
    flex: 1,
    minWidth: 180,
    renderCell: params => moment(params.value as string).format('DD.MM.YYYY HH:mm'),
  },
];

export default columns;
