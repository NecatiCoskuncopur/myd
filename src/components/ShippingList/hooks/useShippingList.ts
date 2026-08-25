'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ReadonlyURLSearchParams } from 'next/navigation';

import listShipping from '@/app/actions/shipping/listShipping';
import { generalMessages } from '@/constants';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { ShippingTypes } from '@/types/shipping';

const useShippingList = (searchParams: ReadonlyURLSearchParams) => {
  const { showSnackbar } = useSnackbar();

  const [rows, setRows] = useState<ShippingTypes.IShipping[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const requestIdRef = useRef(0);

  const page = Number(searchParams.get('sayfa')) || 1;
  const limit = Number(searchParams.get('limit')) || 5;

  const filters = useMemo(
    () => ({
      trackingNumber: searchParams.get('trackingNumber') || undefined,
      senderName: searchParams.get('senderName') || undefined,
      consigneeName: searchParams.get('consigneeName') || undefined,
      consigneeCompany: searchParams.get('consigneeCompany') || undefined,
      consigneePhone: searchParams.get('consigneePhone') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    }),
    [searchParams],
  );

  const fetchList = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    setIsLoading(true);

    try {
      const response = await listShipping({
        page,
        limit,
        ...filters,
      });

      if (requestId !== requestIdRef.current) {
        return;
      }

      if (response.status === 'ERROR' || !response.data || !('shippings' in response.data)) {
        setRows([]);
        setTotalCount(0);

        showSnackbar(response.message ?? generalMessages.UNEXPECTED_ERROR, 'error');

        return;
      }

      setRows(response.data.shippings);
      setTotalCount(response.data.totalCount);
    } catch {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setRows([]);
      setTotalCount(0);

      showSnackbar(generalMessages.UNEXPECTED_ERROR, 'error');
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [page, limit, filters, showSnackbar]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  return {
    rows,
    totalCount,
    isLoading,
    page,
    limit,
    refetch: fetchList,
  };
};

export default useShippingList;
