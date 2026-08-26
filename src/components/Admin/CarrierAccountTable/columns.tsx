'use client';

import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Box, Typography } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import moment from 'moment';

import { Carrier } from '@/constants';
import getCarrierIcon from '@/lib/getCarrierIcon';

const columns: GridColDef[] = [
  {
    field: 'name',
    headerName: 'Hesap Adı',
    flex: 1,
    minWidth: 100,
  },
  {
    field: 'displayName',
    headerName: 'Görünen Hesap Adı',
    flex: 1,
    minWidth: 100,
  },
  {
    field: 'carrier',
    headerName: 'Taşıyıcı Firma',
    flex: 1,
    minWidth: 140,
    renderCell: params => {
      const carrier = params.value as Carrier;

      const icon = getCarrierIcon(carrier);

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
              alignItems: 'center',
              fontSize: 18,
            }}
          >
            {icon}
          </Box>

          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {carrier}
          </Typography>
        </Box>
      );
    },
  },
  {
    field: 'accountType',
    headerName: 'Hesap Tipi',
    flex: 1,
    minWidth: 100,
  },
  {
    field: 'accountNumber',
    headerName: 'Hesap Numarası',
    flex: 1,
    minWidth: 100,
  },
  {
    field: 'isActive',
    headerName: 'Durum',
    flex: 1,
    minWidth: 80,
    renderCell: params => (params.value ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />),
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
