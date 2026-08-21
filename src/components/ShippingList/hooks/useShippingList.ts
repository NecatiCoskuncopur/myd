'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ReadonlyURLSearchParams } from 'next/navigation';

import listShipping from '@/app/actions/shipping/listShipping';
import { generalMessages } from '@/constants';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { ShippingTypes } from '@/types/shipping';

const useShippingList = (searchParams: ReadonlyURLSearchParams) => {
  const { showSnackbar } = useSnackbar();

  const [data, setData] = useState<ShippingTypes.IShippingData | null>(null);
  const [loading, setLoading] = useState(false);
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

    setLoading(true);

    try {
      const response = await listShipping({
        page,
        limit,
        ...filters,
      });

      if (requestId !== requestIdRef.current) {
        return;
      }

      if (response.status === 'OK' && response.data && 'shippings' in response.data) {
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
    void fetchList();
  }, [fetchList]);

  const rows = useMemo(() => data?.shippings ?? [], [data]);

  return {
    data,
    rows,
    loading,
    page,
    limit,
    refetch: fetchList,
  };
};

export default useShippingList;
