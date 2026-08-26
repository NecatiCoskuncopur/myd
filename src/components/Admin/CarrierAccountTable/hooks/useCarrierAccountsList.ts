'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReadonlyURLSearchParams } from 'next/navigation';

import getCarrierAccounts from '@/app/actions/admin/getCarrierAccounts';
import { Carrier, CarrierAccountTypeEnum, generalMessages } from '@/constants';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { CarrierAccountTypes } from '@/types/carrierAccount';

const useCarrierAccountsList = (searchParams: ReadonlyURLSearchParams) => {
  const { showSnackbar } = useSnackbar();

  const [data, setData] = useState<CarrierAccountTypes.ICarrierAccountData | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const requestIdRef = useRef(0);

  const page = Number(searchParams.get('sayfa')) || 1;

  const limit = Number(searchParams.get('limit')) || 5;

  const filters = useMemo(
    () => ({
      name: searchParams.get('name') || undefined,

      displayName: searchParams.get('displayName') || undefined,

      accountType: (searchParams.get('accountType') as CarrierAccountTypeEnum) || undefined,

      accountNumber: searchParams.get('accountNumber') || undefined,

      carrier: (searchParams.get('carrier') as Carrier) || undefined,

      isActive: searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined,
    }),
    [searchParams],
  );

  const fetchCarrierAccounts = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    setIsLoading(true);

    try {
      const response = await getCarrierAccounts({
        page,
        limit,
        ...filters,
      });

      if (requestId !== requestIdRef.current) {
        return;
      }

      if (response.status === 'OK' && response.data) {
        setData(response.data);
        return;
      }

      setData(null);

      showSnackbar(response.message ?? generalMessages.UNEXPECTED_ERROR, 'error');
    } catch {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setData(null);

      showSnackbar(generalMessages.UNEXPECTED_ERROR, 'error');
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [page, limit, filters, showSnackbar]);

  useEffect(() => {
    void fetchCarrierAccounts();
  }, [fetchCarrierAccounts]);

  const rows = useMemo(
    () =>
      data?.carrierAccounts.map(account => ({
        id: account._id,
        ...account,
      })) ?? [],
    [data],
  );

  return {
    data,
    rows,
    isLoading,
    page,
    limit,
    refetch: fetchCarrierAccounts,
  };
};

export default useCarrierAccountsList;
