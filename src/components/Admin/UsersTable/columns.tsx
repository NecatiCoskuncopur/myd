'use client';

import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Box, Chip } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import moment from 'moment';

import { currency } from '@/constants';

const columns: GridColDef[] = [
  {
    field: 'firstName',
    headerName: 'Ad',
    flex: 0.8,
    minWidth: 80,
  },
  {
    field: 'lastName',
    headerName: 'Soyad',
    flex: 0.8,
    minWidth: 80,
  },
  {
    field: 'company',
    headerName: 'Firma',
    flex: 1,
    minWidth: 80,
  },
  {
    field: 'phone',
    headerName: 'Telefon',
    flex: 1,
    minWidth: 100,
  },
  {
    field: 'email',
    headerName: 'E-Posta',
    flex: 1.2,
    minWidth: 100,
  },
  {
    field: 'address',
    headerName: 'Adres',
    flex: 1.5,
    minWidth: 120,
    valueGetter: (value, row) => {
      const address = row.address;

      if (!address) {
        return '-';
      }

      const fullAddress = `${address.line1 ?? ''} ${address.line2 ?? ''}, ${address.district ?? ''}/${address.city ?? ''} ${address.postalCode ?? ''}`;
      return fullAddress.trim() === ',' ? '-' : fullAddress;
    },
  },
  {
    field: 'role',
    headerName: 'Rol',
    flex: 1,
    minWidth: 90,
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
    minWidth: 70,
    sortable: true,
    renderCell: params => `${(params.row.balance ?? 0).toFixed(2)}${currency}`,
  },
  {
    field: 'isActive',
    headerName: 'Aktif',
    flex: 0.5,
    minWidth: 55,
    sortable: true,
    align: 'center',
    headerAlign: 'center',
    renderCell: params => (
      <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center' }}>
        {params.value ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
      </Box>
    ),
  },
  {
    field: 'createdAt',
    headerName: 'Tarih',
    flex: 1,
    minWidth: 90,
    renderCell: params => (params.value ? moment(params.value as string).format('DD.MM.YYYY HH:mm') : '-'),
  },
];

export default columns;
