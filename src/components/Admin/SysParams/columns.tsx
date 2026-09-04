'use client';

import type { GridColDef } from '@mui/x-data-grid';
import moment from 'moment';
import MaskedValueCell from '@/components/Admin/SysParams/MaskedValueCell';

const columns: GridColDef[] = [
  {
    field: 'key',
    headerName: 'Anahtar',
    flex: 1,
    minWidth: 200,
  },
  {
    field: 'value',
    headerName: 'Değer',
    flex: 1,
    minWidth: 200,
    renderCell: params => <MaskedValueCell value={(params.value as string) ?? ''} />,
  },
  {
    field: 'createdAt',
    headerName: 'Oluşturulma Tarihi',
    flex: 1,
    minWidth: 180,
    renderCell: params => moment(params.value as string).format('DD.MM.YYYY'),
  },
];

export default columns;
