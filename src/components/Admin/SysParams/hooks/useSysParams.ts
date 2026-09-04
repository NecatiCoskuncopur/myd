'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReadonlyURLSearchParams } from 'next/navigation';

import getSysParams from '@/app/actions/sysParam/getSysParams';
import { generalMessages } from '@/constants';
import { useSnackbar } from '@/providers/SnackbarProvider';

const useSysParams = (searchParams: ReadonlyURLSearchParams) => {
  const { showSnackbar } = useSnackbar();

  const [data, setData] = useState<SysParamTypes.ISysParamData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const requestIdRef = useRef(0);
  const page = Number(searchParams.get('sayfa')) || 1;
  const limit = Number(searchParams.get('limit')) || 5;

  const filters = useMemo(
    () => ({
      key: searchParams.get('key') || undefined,
    }),
    [searchParams],
  );

  const fetchSysParams = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);

    try {
      const response = await getSysParams({
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
    void fetchSysParams();
  }, [fetchSysParams]);

  const rows = useMemo(
    () =>
      data?.sysParams?.map(sysParam => ({
        id: sysParam._id,
        ...sysParam,
      })) ?? [],
    [data],
  );

  return {
    data,
    rows,
    isLoading,
    page,
    limit,
    refetch: fetchSysParams,
  };
};

export default useSysParams;
