'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Box, Typography, useTheme } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import getUserBalance from '@/app/actions/user/getUserBalance';
import columns from './columns';

const UserBalanceTable = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();

  const page = useMemo(() => Number(searchParams.get('sayfa')) || 1, [searchParams]);
  const limit = useMemo(() => Number(searchParams.get('limit')) || 5, [searchParams]);

  const [data, setData] = useState<BalanceTypes.IUserBalanceData | null>(null);
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

  return (
    <Box
      sx={{
        width: '100%',
        height: 'calc(100vh - 48px)',
        backgroundColor: theme.palette.dashboard.sidebar,
        color: theme.palette.dashboard.textSidebar,
        p: { xs: 2.5, md: 4 },
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 3,
          pb: 2.5,
          borderBottom: '1px solid',
          borderColor: 'rgba(255, 255, 255, 0.08)',
          flexShrink: 0,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              letterSpacing: '-0.02em',
              fontSize: { xs: '1.25rem', md: '28px' },
            }}
          >
            Cari Hesabım
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mt: 0.5,
              fontSize: '0.875rem',
            }}
          >
            Tüm işlem geçmişinizi ve anlık bakiye durumunuzu buradan takip edebilirsiniz.
          </Typography>
        </Box>

        <Box
          sx={{
            px: 2.5,
            py: 1.25,
            borderRadius: '12px',
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
            border: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            alignSelf: { xs: 'stretch', sm: 'auto' },
            justifyContent: { xs: 'space-between', sm: 'flex-start' },
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              textTransform: 'uppercase',
              fontWeight: 600,
              letterSpacing: '0.05em',
            }}
          >
            Güncel Bakiye
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#22c55e',
              lineHeight: 1,
            }}
          >
            {data?.total ? Math.round((data.total + Number.EPSILON) * 100) / 100 : 0}$
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          width: '100%',
          flex: 1,
          minHeight: 0,
          overflowX: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            minWidth: 1200,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
          }}
        >
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            paginationMode="server"
            rowCount={data?.totalCount ?? 0}
            pageSizeOptions={[1, 5, 10, 50]}
            paginationModel={{ page: page - 1, pageSize: limit }}
            onPaginationModelChange={model => {
              const isPageSizeChanged = model.pageSize !== limit;
              router.push(`?sayfa=${isPageSizeChanged ? 1 : model.page + 1}&limit=${model.pageSize}`);
            }}
            sx={{
              flex: 1,
              width: '100%',
              border: 'none',

              '& .MuiDataGrid-main': {
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
              },
              '& .MuiDataGrid-virtualScroller': {
                flexGrow: 1,
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default UserBalanceTable;
