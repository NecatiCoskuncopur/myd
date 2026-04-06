'use client';

import { GridColDef } from '@mui/x-data-grid';
import moment from 'moment';

const columns: GridColDef[] = [
  { field: '_id', headerName: 'ID', flex: 1, minWidth: 100 },
  { field: 'name', headerName: 'Fiyat Listesi Adı', flex: 1, minWidth: 100 },
  {
    field: 'createdAt',
    headerName: 'Oluşturulma Tarihi',
    flex: 1,
    minWidth: 180,
    renderCell: params => moment(params.value as string).format('DD.MM.YYYY'),
  },
];

export default columns;
