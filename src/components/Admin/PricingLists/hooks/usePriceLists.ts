'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ReadonlyURLSearchParams } from 'next/navigation';

import getPricingLists from '@/app/actions/admin/getPricingLists';
import { CarrierAccountTypeEnum, generalMessages } from '@/constants';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { PricingListTypes } from '@/types/pricingList';

const usePriceLists = (searchParams: ReadonlyURLSearchParams) => {
  const { showSnackbar } = useSnackbar();

  const [data, setData] = useState<PricingListTypes.IPricingListData | null>(null);

  const [loading, setLoading] = useState(false);

  const requestIdRef = useRef(0);

  const page = Number(searchParams.get('sayfa')) || 1;
  const limit = Number(searchParams.get('limit')) || 5;

  const filters = useMemo(
    () => ({
      name: searchParams.get('name') || undefined,

      listType: (searchParams.get('listType') as CarrierAccountTypeEnum) || undefined,
    }),
    [searchParams],
  );

  const fetchPricingLists = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    setLoading(true);

    try {
      const response = await getPricingLists({
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
        setLoading(false);
      }
    }
  }, [page, limit, filters, showSnackbar]);

  useEffect(() => {
    fetchPricingLists();
  }, [fetchPricingLists]);

  const rows = useMemo(
    () =>
      data?.pricingLists?.map(pricingList => ({
        id: pricingList._id,
        ...pricingList,
      })) ?? [],
    [data],
  );

  return {
    data,
    rows,
    loading,
    page,
    limit,
    refetch: fetchPricingLists,
  };
};

export default usePriceLists;
