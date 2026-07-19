import { Box, Chip, Link, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import moment from 'moment';

const columns: GridColDef[] = [
  {
    field: 'amount',
    headerName: 'İşlem Tutarı',
    flex: 1,
    minWidth: 150,
    renderCell: params => {
      const isSpend = params.row.transactionType === 'SPEND';
      return (
        <Typography
          sx={{
            fontWeight: 'bold',
            color: isSpend ? 'error.main' : 'success.main',
            display: 'flex',
            alignItems: 'center',
            height: '100%',
          }}
        >
          {isSpend ? '' : '+'}
          {params.value}$
        </Typography>
      );
    },
  },
  {
    field: 'transactionType',
    headerName: 'İşlem Tipi',
    flex: 1,
    minWidth: 150,
    renderCell: params => {
      const type = params.value as string;

      let config = {
        label: 'Bilinmiyor',
        bg: 'rgba(239, 68, 68, 0.12)',
        border: 'rgba(239, 68, 68, 0.25)',
        text: '#ef4444',
      };

      if (type === 'SPEND') {
        config = {
          label: 'Harcama',
          bg: 'rgba(239, 68, 68, 0.12)',
          border: 'rgba(239, 68, 68, 0.25)',
          text: '#fca5a5',
        };
      } else if (type === 'PAY') {
        config = {
          label: 'Ödeme',
          bg: 'rgba(34, 197, 94, 0.12)',
          border: 'rgba(34, 197, 94, 0.25)',
          text: '#86efac',
        };
      }

      return (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Chip
            label={config.label}
            size="small"
            sx={{
              fontWeight: 600,
              fontSize: '0.75rem',
              letterSpacing: '0.02em',
              borderRadius: '6px',
              backgroundColor: config.bg,
              color: config.text,
              border: '1px solid',
              borderColor: config.border,
              '&:hover': {
                backgroundColor: config.bg,
              },
            }}
          />
        </Box>
      );
    },
  },
  {
    field: 'createdAt',
    headerName: 'Oluşturulma Tarihi',
    flex: 1,
    minWidth: 200,
    renderCell: params => (
      <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', color: 'text.secondary' }}>
        {moment(params.value as string).format('DD.MM.YYYY HH:mm')}
      </Box>
    ),
  },
  {
    field: 'shippingId',
    headerName: 'İşlemler',
    flex: 1,
    minWidth: 200,
    renderCell: params => (
      <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        {params.value ? (
          <Link
            href={`/panel/gonderilerim/${params.value}`}
            sx={{
              fontWeight: 500,
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Gönderiye Git
          </Link>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
            -
          </Typography>
        )}
      </Box>
    ),
  },
];

export default columns;
