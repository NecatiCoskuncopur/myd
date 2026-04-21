'use client';

import CancelIcon from '@mui/icons-material/Cancel';
import { GridCheckCircleIcon, GridColDef } from '@mui/x-data-grid';
import moment from 'moment';

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Hesap Adı', flex: 1, minWidth: 100 },
  { field: 'carrier', headerName: 'Taşıyıcı Firma', flex: 1, minWidth: 100 },
  { field: 'accountNumber', headerName: 'Hesap Numarası', flex: 1, minWidth: 100 },
  {
    field: 'isActive',
    headerName: 'Durum',
    flex: 1,
    minWidth: 50,
    renderCell: params => (params.value ? <GridCheckCircleIcon color="success" /> : <CancelIcon color="error" />),
  },
  {
    field: 'createdAt',
    headerName: 'Oluşturulma Tarihi',
    flex: 1,
    minWidth: 150,
    renderCell: params => moment(params.value as string).format('DD.MM.YYYY HH:mm'),
  },
];

export default columns;
