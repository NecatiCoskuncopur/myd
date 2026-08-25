'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import getUserBalance from '@/app/actions/user/getUserBalance';
import { GenericDataGrid, TableHeader, Wrapper } from '@/components';
import { generalMessages } from '@/constants';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { BalanceTypes } from '@/types/balance';

import columns from './columns';
import CurrentBalance from './CurrentBalance';

const UserBalanceTable = () => {
  const searchParams = useSearchParams();
  const { showSnackbar } = useSnackbar();

  const page = Number(searchParams.get('sayfa')) || 1;
  const limit = Number(searchParams.get('limit')) || 5;

  const [data, setData] = useState<BalanceTypes.IUserBalanceData | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const fetchBalance = async () => {
      setIsLoading(true);

      try {
        const response = await getUserBalance({
          page,
          limit,
        });

        if (!isActive) {
          return;
        }

        if (response.status !== 'OK' || !response.data) {
          setData(null);

          showSnackbar(response.message ?? generalMessages.UNEXPECTED_ERROR, 'error');

          return;
        }

        setData(response.data);
      } catch {
        if (!isActive) {
          return;
        }

        setData(null);

        showSnackbar(generalMessages.UNEXPECTED_ERROR, 'error');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void fetchBalance();

    return () => {
      isActive = false;
    };
  }, [page, limit, showSnackbar]);

  const rows =
    data?.transactions.map((transaction, index) => ({
      id: `${transaction.createdAt}-${index}`,
      transactionId: `${transaction.createdAt}-${index}`,
      amount: transaction.amount,
      transactionType: transaction.transactionType,
      createdAt: transaction.createdAt,
      shippingId: transaction.shippingId,
    })) ?? [];

  return (
    <Wrapper>
      <TableHeader title="Cari Hesabım" subTitle="Tüm işlem geçmişinizi ve anlık bakiye durumunuzu buradan takip edebilirsiniz.">
        <CurrentBalance total={data?.total ?? 0} />
      </TableHeader>

      <GenericDataGrid
        rows={rows}
        columns={columns}
        loading={isLoading}
        totalCount={data?.totalCount ?? 0}
        page={page}
        limit={limit}
        searchParams={searchParams}
        noRowsMessage="Bu hesaba ait ödeme ve harcama geçmişi bulunmamaktadır."
      />
    </Wrapper>
  );
};

export default UserBalanceTable;
