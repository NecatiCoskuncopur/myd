'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ReadonlyURLSearchParams } from 'next/navigation';

import getAllUsers from '@/app/actions/admin/getAllUsers';

import { generalMessages } from '@/constants';

import { useSnackbar } from '@/providers/SnackbarProvider';

import { AdminTypes } from '@/types/admin';

const useUsersList = (searchParams: ReadonlyURLSearchParams) => {
  const { showSnackbar } = useSnackbar();
  const [data, setData] = useState<AdminTypes.IUsersData | null>(null);
  const [loading, setLoading] = useState(false);
  const requestIdRef = useRef(0);
  const page = Number(searchParams.get('sayfa')) || 1;
  const limit = Number(searchParams.get('limit')) || 5;

  const filters = useMemo(
    () => ({
      firstName: searchParams.get('firstName') || '',
      lastName: searchParams.get('lastName') || '',
      company: searchParams.get('company') || '',
      phone: searchParams.get('phone') || '',
      email: searchParams.get('email') || '',
      balanceSorting: searchParams.get('balanceSorting') ?? '',
    }),
    [searchParams],
  );

  const fetchUsers = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    setLoading(true);

    try {
      const response = await getAllUsers({
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
    void fetchUsers();
  }, [fetchUsers]);

  const rows = useMemo(
    () =>
      data?.users?.map(user => ({
        id: user._id,
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        nickname: user.nickname,
        company: user.company,
        taxId: user.taxId,
        taxOffice: user.taxOffice,
        phone: user.phone,
        priceLists: user.priceLists,
        address: user.address,
        role: user.role,
        isActive: user.isActive,
        barcodePermits: user.barcodePermits,
        balance: user.balance.total,
        createdAt: user.createdAt,
        originalUser: user,
      })) ?? [],
    [data],
  );

  return {
    data,
    rows,
    loading,
    page,
    limit,
    refetch: fetchUsers,
  };
};

export default useUsersList;
