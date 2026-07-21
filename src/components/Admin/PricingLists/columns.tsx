'use client';

import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { Box, Tooltip } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import moment from 'moment';

const columns: GridColDef[] = [
  {
    field: 'name',
    headerName: 'Fiyat Listesi Adı',
    flex: 1,
    minWidth: 200,
    renderCell: params => {
      const isDefault = params.row.isDefault;

      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, height: '100%' }}>
          {params.value}
          {isDefault && (
            <Tooltip title="Varsayılan fiyat listesidir" arrow placement="top">
              <StarRoundedIcon color="warning" sx={{ fontSize: 18, cursor: 'pointer' }} />
            </Tooltip>
          )}
        </Box>
      );
    },
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
