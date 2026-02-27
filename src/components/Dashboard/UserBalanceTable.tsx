'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { Box, Chip, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import moment from 'moment';

import getUserBalance from '@/app/actions/user/getUserBalance';

const UserBalanceTable = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('sayfa')) || 1;
  const limit = Number(searchParams.get('limit')) || 5;

  const [data, setData] = useState<IUserBalanceData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchBalance = async () => {
      setLoading(true);

      try {
        const result = await getUserBalance({ page, limit });

        if (result.status === 'OK' && result.data) {
          setData(result.data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [page, limit]);

  const rows = useMemo(() => {
    return (
      data?.transactions.map((tx, index) => ({
        id: `${tx.createdAt}-${index}`,
        transactionId: `${tx.createdAt}-${index}`,
        amount: tx.amount,
        transactionType: tx.transactionType,
        createdAt: tx.createdAt,
        shippingId: tx.shippingId,
      })) ?? []
    );
  }, [data]);

  const columns: GridColDef[] = [
    {
      field: 'transactionId',
      headerName: 'İşlem Anahtarı',
      flex: 1,
      minWidth: 220,
    },
    {
      field: 'amount',
      headerName: 'İşlem Tutarı',
      flex: 1,
      minWidth: 150,
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

  return (
    <>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Cari Hesabım
      </Typography>

      <Typography sx={{ mb: 3 }}>Güncel Bakiye: {data?.total ? Math.round((data.total + Number.EPSILON) * 100) / 100 : 0}</Typography>

      <Box sx={{ width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          paginationMode="server"
          rowCount={data?.totalCount ?? 0}
          pageSizeOptions={[1, 5, 10, 50]}
          paginationModel={{
            page: page - 1,
            pageSize: limit,
          }}
          onPaginationModelChange={model => {
            const isPageSizeChanged = model.pageSize !== limit;

            router.push(`?sayfa=${isPageSizeChanged ? 1 : model.page + 1}&limit=${model.pageSize}`);
          }}
        />
      </Box>
    </>
  );
};

export default UserBalanceTable;
