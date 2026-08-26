'use client';

import { useEffect, useState } from 'react';

import getPricingList from '@/app/actions/admin/getPricingList';
import getUser from '@/app/actions/user/getUser';
import getUserPermittedAccounts from '@/app/actions/user/getUserPermittedAccounts';
import { CarrierAccountTypes } from '@/types/carrierAccount';
import { PricingListTypes } from '@/types/pricingList';
import { UserTypes } from '@/types/user';

const useShippingUser = () => {
  const [user, setUser] = useState<UserTypes.UserDto | null>(null);

  const [pricingLists, setPricingLists] = useState<Record<string, PricingListTypes.IPricingList>>({});

  const [accounts, setAccounts] = useState<CarrierAccountTypes.IUserPermittedAccount[]>([]);

  const canCreateBarcode = (user?.barcodePermits?.length ?? 0) > 0;

  useEffect(() => {
    let isActive = true;

    const fetchUser = async () => {
      try {
        const response = await getUser();

        if (!isActive) {
          return;
        }

        if (response.status === 'OK' && response.data) {
          setUser(response.data);
          return;
        }

        setUser(null);
      } catch {
        if (isActive) {
          setUser(null);
        }
      }
    };

    void fetchUser();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    const fetchPricingLists = async () => {
      const userPriceLists = user?.priceLists ?? [];

      if (userPriceLists.length === 0) {
        setPricingLists({});
        return;
      }

      try {
        const results = await Promise.all(
          userPriceLists.map(async ({ serviceType, priceListId }) => {
            const response = await getPricingList(priceListId);

            if (response.status !== 'OK' || !response.data) {
              return null;
            }

            return [serviceType, response.data] as const;
          }),
        );

        if (!isActive) {
          return;
        }

        const entries = results.filter((entry): entry is NonNullable<typeof entry> => entry !== null);

        setPricingLists(Object.fromEntries(entries));
      } catch {
        if (isActive) {
          setPricingLists({});
        }
      }
    };

    void fetchPricingLists();

    return () => {
      isActive = false;
    };
  }, [user?.priceLists]);

  useEffect(() => {
    let isActive = true;

    if (!canCreateBarcode) {
      setAccounts([]);
      return;
    }

    const fetchAccounts = async () => {
      try {
        const response = await getUserPermittedAccounts();

        if (!isActive) {
          return;
        }

        if (response.status === 'OK' && response.data) {
          setAccounts(response.data);
          return;
        }

        setAccounts([]);
      } catch {
        if (isActive) {
          setAccounts([]);
        }
      }
    };

    void fetchAccounts();

    return () => {
      isActive = false;
    };
  }, [canCreateBarcode]);

  return {
    pricingLists,
    accounts,
    canCreateBarcode,
  };
};

export default useShippingUser;
