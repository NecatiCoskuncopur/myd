'use client';

import { useEffect, useState } from 'react';

import getUserPricingLists from '@/app/actions/user/getUserPricingList';
import getUser from '@/app/actions/user/getUser';
import getUserPermittedAccounts from '@/app/actions/user/getUserPermittedAccounts';

import { generalMessages } from '@/constants';
import { CarrierAccountTypes } from '@/types/carrierAccount';
import { PricingListTypes } from '@/types/pricingList';
import { UserTypes } from '@/types/user';

const { UNEXPECTED_ERROR } = generalMessages;

const useShippingUser = () => {
  const [user, setUser] = useState<UserTypes.UserDto | null>(null);
  const [pricingLists, setPricingLists] = useState<Record<string, PricingListTypes.IPricingList>>({});
  const [accounts, setAccounts] = useState<Partial<CarrierAccountTypes.ICarrierAccount>[]>([]);
  const canCreateBarcode = (user?.barcodePermits?.length ?? 0) > 0;

  useEffect(() => {
    const fetchUser = async () => {
      const result = await getUser();

      if (result.status === 'OK' && result.data) {
        setUser(result.data);
        return;
      }

      setUser(null);
    };

    void fetchUser();
  }, []);

  useEffect(() => {
    const fetchPricingLists = async () => {
      const response = await getUserPricingLists();

      if (response.status === 'OK' && response.data) {
        setPricingLists(response.data);

        return;
      }

      setPricingLists({});

      console.error(response.message || UNEXPECTED_ERROR);
    };

    void fetchPricingLists();
  }, []);

  useEffect(() => {
    if (!canCreateBarcode) {
      setAccounts([]);
      return;
    }

    const fetchAccounts = async () => {
      const response = await getUserPermittedAccounts();

      if (response.status === 'OK' && response.data) {
        setAccounts(response.data);
        return;
      }

      setAccounts([]);

      console.error(response.message || UNEXPECTED_ERROR);
    };

    void fetchAccounts();
  }, [canCreateBarcode]);

  return {
    user,
    pricingLists,
    accounts,
    canCreateBarcode,
  };
};

export default useShippingUser;
