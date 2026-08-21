'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import getUserBalance from '@/app/actions/user/getUserBalance';
import { GenericDataGrid, TableHeader, Wrapper } from '@/components';
import { BalanceTypes } from '@/types/balance';

import columns from './columns';
import CurrentBalance from './CurrentBalance';

const UserBalanceTable = () => {
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

      <GenericDataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        totalCount={data?.totalCount}
        page={page}
        limit={limit}
        searchParams={searchParams}
        noRowsMessage="Bu hesaba ait ödeme ve harcama geçmişi bulunmamaktadır."
      />
    </Wrapper>
  );
};

export default UserBalanceTable;
