'use client';

import { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useForm } from 'react-hook-form';

import getCarrierAccounts from '@/app/actions/admin/getCarrierAccounts';
import getPricingLists from '@/app/actions/admin/getPricingLists';
import setUser from '@/app/actions/admin/setUser';
import StyledButton from '@/components/StyledButton';
import { CarrierAccountTypeEnum, generalMessages, userMessages } from '@/constants';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { AdminTypes } from '@/types/admin';
import { CarrierAccountTypes } from '@/types/carrierAccount';
import { PricingListTypes } from '@/types/pricingList';
import { UserTypes } from '@/types/user';

import FormItems from './FormItems';

const { UNEXPECTED_ERROR } = generalMessages;
const { EDITUSER } = userMessages;

const priceListTypes = Object.values(CarrierAccountTypeEnum);

const defaultValues: AdminTypes.ISetUserPayload = {
  userId: '',
  firstName: '',
  lastName: '',
  nickname: '',
  company: '',
  taxId: '',
  taxOffice: '',
  phone: '',
  email: '',
  address: {
    line1: '',
    line2: '',
    district: '',
    city: '',
    postalCode: '',
  },
  role: 'CUSTOMER',
  isActive: true,
  priceLists: priceListTypes.map(serviceType => ({
    serviceType,
    priceListId: '',
  })),
  barcodePermits: [],
};

interface Props {
  open: boolean;
  onClose: () => void;
  user: UserTypes.UserDto | null;
  onSuccess?: () => void;
}

const EditUser = ({ open, onClose, user, onSuccess }: Props) => {
  const { showSnackbar } = useSnackbar();

  const [pricingLists, setPricingLists] = useState<PricingListTypes.IPricingList[]>([]);

  const [carrierAccountsData, setCarrierAccountsData] = useState<CarrierAccountTypes.ICarrierAccountData | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminTypes.ISetUserPayload>({
    defaultValues,
  });

  useEffect(() => {
    if (!open || !user) {
      return;
    }

    reset({
      userId: user._id,
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      nickname: user.nickname ?? '',
      company: user.company ?? '',
      taxId: user.taxId ?? '',
      taxOffice: user.taxOffice ?? '',
      phone: user.phone ?? '',
      email: user.email ?? '',
      address: {
        line1: user.address?.line1 ?? '',
        line2: user.address?.line2 ?? '',
        district: user.address?.district ?? '',
        city: user.address?.city ?? '',
        postalCode: user.address?.postalCode ?? '',
      },
      role: user.role,
      isActive: user.isActive,
      priceLists: priceListTypes.map(serviceType => {
        const currentPriceList = user.priceLists?.find(item => item.serviceType === serviceType);

        return {
          serviceType,
          priceListId: currentPriceList?.priceListId?.toString() ?? '',
        };
      }),

      barcodePermits: user.barcodePermits ?? [],
    });
  }, [open, user, reset]);

  useEffect(() => {
    if (!open) {
      reset(defaultValues);
    }
  }, [open, reset]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let isActive = true;

    const loadData = async () => {
      try {
        const [pricingResponse, carrierResponse] = await Promise.all([
          getPricingLists(),
          getCarrierAccounts({
            limit: 100,
            isActive: true,
          }),
        ]);

        if (!isActive) {
          return;
        }

        if (pricingResponse.status === 'OK' && pricingResponse.data) {
          setPricingLists(pricingResponse.data.pricingLists);
        } else {
          setPricingLists([]);

          showSnackbar(pricingResponse.message ?? UNEXPECTED_ERROR, 'error');
        }

        if (carrierResponse.status === 'OK' && carrierResponse.data) {
          setCarrierAccountsData(carrierResponse.data);
        } else {
          setCarrierAccountsData(null);

          showSnackbar(carrierResponse.message ?? UNEXPECTED_ERROR, 'error');
        }
      } catch {
        if (!isActive) {
          return;
        }

        setPricingLists([]);
        setCarrierAccountsData(null);

        showSnackbar(UNEXPECTED_ERROR, 'error');
      }
    };

    void loadData();

    return () => {
      isActive = false;
    };
  }, [open, showSnackbar]);

  const onSubmit = async (values: AdminTypes.ISetUserPayload) => {
    try {
      const response = await setUser(values);

      if (response.status === 'ERROR') {
        showSnackbar(response.message ?? UNEXPECTED_ERROR, 'error');

        return;
      }

      showSnackbar(response.message ?? EDITUSER.SUCCESS, 'success');

      onSuccess?.();
      onClose();
      reset(defaultValues);
    } catch {
      showSnackbar(UNEXPECTED_ERROR, 'error');
    }
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: theme => ({
            backgroundImage: 'none',
            backgroundColor: theme.palette.dashboard.sidebar,
          }),
        },
      }}
    >
      <DialogTitle>Üyeyi Düzenle</DialogTitle>

      <DialogContent dividers>
        <FormItems control={control} errors={errors} pricingLists={pricingLists} carrierAccounts={carrierAccountsData?.carrierAccounts ?? []} />
      </DialogContent>

      <DialogActions sx={{ m: 2 }}>
        <Button type="button" onClick={handleClose} disabled={isSubmitting}>
          İptal
        </Button>

        <StyledButton type="button" variant="contained" onClick={handleSubmit(onSubmit)} loading={isSubmitting} disabled={isSubmitting}>
          Kaydet
        </StyledButton>
      </DialogActions>
    </Dialog>
  );
};

export default EditUser;
