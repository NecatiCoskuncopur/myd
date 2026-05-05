import { Chip, Link, Typography } from '@mui/material';
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
        <Typography sx={{ fontWeight: 'bold', color: isSpend ? 'error.main' : 'success.main' }}>
          {isSpend ? '-' : '+'} {params.value} $
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

      if (type === 'SPEND') {
        return <Chip label="Harcama" color="primary" size="small" />;
      }

      if (type === 'PAY') {
        return <Chip label="Ödeme" color="success" size="small" />;
      }

      return <Chip label="Bilinmiyor" color="error" size="small" />;
    },
  },
  {
    field: 'createdAt',
    headerName: 'Oluşturulma Tarihi',
    flex: 1,
    minWidth: 200,
    renderCell: params => moment(params.value as string).format('DD.MM.YYYY HH:mm'),
  },
  {
    field: 'shippingId',
    headerName: 'İşlemler',
    flex: 1,
    minWidth: 200,
    renderCell: params => (params.value ? <Link href={`/panel/gonderilerim/${params.value}`}>Gönderiye Git</Link> : null),
  },
];

export default columns;
