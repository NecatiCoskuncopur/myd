'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { DataGrid } from '@mui/x-data-grid';
import { Wrapper, TableWrapper, TableHeader } from '@/components';
import getUserBalance from '@/app/actions/user/getUserBalance';
import columns from './columns';
import CurrentBalance from './CurrentBalance';
import { BalanceTypes } from '@/types/balance';

const UserBalanceTable = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('sayfa')) || 1;
  const limit = Number(searchParams.get('limit')) || 5;

  const [data, setData] = useState<BalanceTypes.IUserBalanceData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let isActive = true;

    const fetchBalance = async () => {
      setLoading(true);

      try {
        const result = await getUserBalance({ page, limit });

        if (!isActive) return;

        if (result.status === 'OK' && result.data) {
          setData(result.data);
        } else {
          setData(null);
        }
      } catch (error) {
        if (!isActive) return;

        console.error(error);
        setData(null);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchBalance();

    return () => {
      isActive = false;
    };
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
    <Wrapper>
      <TableHeader title="Cari Hesabım" subTitle="Tüm işlem geçmişinizi ve anlık bakiye durumunuzu buradan takip edebilirsiniz.">
        <CurrentBalance total={data?.total || 0} />
      </TableHeader>

      <TableWrapper>
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
          slotProps={{
            noRowsOverlay: {
              children: 'Bu hesaba ait ödeme ve harcama geçmişi bulunmamaktadır.',
            },
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
      </TableWrapper>
    </Wrapper>
  );
};

export default UserBalanceTable;
