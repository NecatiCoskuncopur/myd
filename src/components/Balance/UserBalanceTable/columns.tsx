import NextLink from 'next/link';
import { alpha, Box, Chip, Link, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import moment from 'moment';

import { BalanceTypes } from '@/types/balance';

export type BalanceRow = BalanceTypes.IUserBalanceData['transactions'][number] & {
  id: string;
};

const columns: GridColDef<BalanceRow>[] = [
  {
    field: 'amount',
    headerName: 'İşlem Tutarı',
    flex: 1,
    minWidth: 150,
    renderCell: ({ row }) => {
      const isSpend = row.transactionType === 'SPEND';

      return (
        <Typography
          sx={{
            fontWeight: 700,
            color: isSpend ? 'error.main' : 'success.main',
            display: 'flex',
            alignItems: 'center',
            height: '100%',
          }}
        >
          {!isSpend && '+'}
          {row.amount}$
        </Typography>
      );
    },
  },
  {
    field: 'transactionType',
    headerName: 'İşlem Tipi',
    flex: 1,
    minWidth: 150,
    renderCell: ({ row }) => {
      const isSpend = row.transactionType === 'SPEND';
      const isPay = row.transactionType === 'PAY';

      const label = isSpend ? 'Harcama' : isPay ? 'Ödeme' : 'Bilinmiyor';

      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <Chip
            label={label}
            size="small"
            sx={theme => {
              const palette = isPay ? theme.palette.success : theme.palette.error;

              return {
                fontWeight: 600,
                fontSize: '0.75rem',
                letterSpacing: '0.02em',
                borderRadius: '6px',
                backgroundColor: alpha(palette.main, 0.12),
                color: palette.main,
                border: '1px solid',
                borderColor: alpha(palette.main, 0.25),
              };
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
    renderCell: ({ row }) => (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          color: 'text.secondary',
        }}
      >
        {moment(row.createdAt).format('DD.MM.YYYY HH:mm')}
      </Box>
    ),
  },
  {
    field: 'shippingId',
    headerName: 'İşlemler',
    flex: 1,
    minWidth: 200,
    sortable: false,
    filterable: false,
    renderCell: ({ row }) => (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: '100%',
        }}
      >
        {row.shippingId ? (
          <Link
            component={NextLink}
            href={`/panel/gonderilerim/${row.shippingId}`}
            sx={{
              fontWeight: 500,
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            Gönderiye Git
          </Link>
        ) : (
          <Typography
            variant="body2"
            sx={{
              color: 'text.disabled',
              fontStyle: 'italic',
            }}
          >
            -
          </Typography>
        )}
      </Box>
    ),
  },
];

export default columns;
