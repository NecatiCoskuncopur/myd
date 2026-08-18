'use client';

import CancelIcon from '@mui/icons-material/Cancel';
import { GridCheckCircleIcon, GridColDef } from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';
import moment from 'moment';

import getCarrierIcon from '@/lib/getCarrierIcon';
import { Carrier } from '@/constants';

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Hesap Adı', flex: 1, minWidth: 100 },
  { field: 'displayName', headerName: 'Görünen Hesap Adı', flex: 1, minWidth: 100 },
  {
    field: 'carrier',
    headerName: 'Taşıyıcı Firma',
    flex: 1,
    minWidth: 140,
    renderCell: params => {
      const carrier = params.value as Carrier;
      const icon = getCarrierIcon(carrier);

      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', fontSize: 18 }}>{icon}</Box>

          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {carrier}
          </Typography>
        </Box>
      );
    },
  },
  { field: 'accountType', headerName: 'Hesap Tipi', flex: 1, minWidth: 100 },
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
