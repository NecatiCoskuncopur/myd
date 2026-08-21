'use client';

import { useEffect, useState } from 'react';

import getPricingList from '@/app/actions/admin/getPricingList';
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
  const [loadingUser, setLoadingUser] = useState(false);
  const [loadingPricingLists, setLoadingPricingLists] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  const canCreateBarcode = (user?.barcodePermits?.length ?? 0) > 0;

  useEffect(() => {
    const fetchUser = async () => {
      setLoadingUser(true);

      try {
        const result = await getUser();

        if (result.status === 'OK' && result.data) {
          setUser(result.data);
          return;
        }

        setUser(null);
      } catch (error) {
        console.error(error);
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchPricingLists = async () => {
      const userPriceLists = user?.priceLists ?? [];

      if (userPriceLists.length === 0) {
        setPricingLists({});
        return;
      }

      setLoadingPricingLists(true);

      try {
        const results = await Promise.all(
          userPriceLists.map(async ({ serviceType, priceListId }) => {
            const result = await getPricingList(priceListId);

            if (result.status !== 'OK' || !result.data) {
              return null;
            }

            return [serviceType, result.data] as const;
          }),
        );

        const pricingListMap = Object.fromEntries(results.filter((entry): entry is NonNullable<typeof entry> => entry !== null));

        setPricingLists(pricingListMap);
      } catch (error) {
        console.error(error);
        setPricingLists({});
      } finally {
        setLoadingPricingLists(false);
      }
    };

    fetchPricingLists();
  }, [user?.priceLists]);

  useEffect(() => {
    if (!canCreateBarcode) {
      setAccounts([]);
      return;
    }

    const fetchAccounts = async () => {
      setLoadingAccounts(true);

      try {
        const result = await getUserPermittedAccounts();

        if (result.status === 'OK' && result.data) {
          setAccounts(result.data);
          return;
        }

        console.error(result.message || UNEXPECTED_ERROR);
        setAccounts([]);
      } catch (error) {
        console.error(error);
        setAccounts([]);
      } finally {
        setLoadingAccounts(false);
      }
    };

    fetchAccounts();
  }, [canCreateBarcode]);

  return {
    user,
    pricingLists,
    accounts,
    canCreateBarcode,

    loadingUser,
    loadingPricingLists,
    loadingAccounts,
  };
};

export default useShippingUser;
