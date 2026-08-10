'use client';

import { useEffect, useState } from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, useTheme } from '@mui/material';
import { useForm } from 'react-hook-form';

import getCarrierAccounts from '@/app/actions/admin/getCarrierAccounts';
import getPricingLists from '@/app/actions/admin/getPricingLists';
import setUser from '@/app/actions/admin/setUser';
import StyledButton from '@/components/StyledButton';
import { generalMessages, userMessages } from '@/constants';
import FormItems from './FormItems';
import { UserTypes } from '@/types/user';
import { AdminTypes } from '@/types/admin';
import { CarrierAccountTypes } from '@/types/carrierAccount';
import { useSnackbar } from '@/providers/SnackbarProvider';

const { UNEXPECTED_ERROR } = generalMessages;
const { EDITUSER } = userMessages;

interface Props {
  open: boolean;
  onClose: () => void;
  user: UserTypes.UserDto | null;
  onSuccess?: () => void;
}

const EditUser = ({ open, onClose, user, onSuccess }: Props) => {
  const [pricingLists, setPricingLists] = useState<PricingListTypes.IPricingList[]>([]);
  const [carrierAccountsData, setCarrierAccountsData] = useState<CarrierAccountTypes.ICarrierAccountData | null>(null);
  const theme = useTheme();

  const { showSnackbar } = useSnackbar();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminTypes.ISetUserPayload>({
    defaultValues: {
      userId: '',
      firstName: '',
      lastName: '',
      nickname: '',
      company: '',
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
      priceListId: '',
      barcodePermits: [],
    },
  });

  useEffect(() => {
    if (!user) return;
    reset({
      userId: user._id,
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      nickname: user.nickname ?? '',
      company: user.company ?? '',
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
      priceListId: user.priceListId?.toString() ?? '',
      barcodePermits: user.barcodePermits ?? [],
    });
  }, [user, pricingLists, reset]);

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = async (values: AdminTypes.ISetUserPayload) => {
    const response = await setUser(values);

    if (response.status === 'ERROR') {
      showSnackbar(response.message ?? UNEXPECTED_ERROR, 'error');
      return;
    }

    showSnackbar(response.message ?? EDITUSER.SUCCESS, 'success');

    onSuccess?.();
    onClose();
    reset();
  };

  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      try {
        const [pricingResponse, carrierResponse] = await Promise.all([
          getPricingLists(),
          getCarrierAccounts({
            limit: 100,
            isActive: true,
          }),
        ]);

        if (pricingResponse.status === 'OK' && pricingResponse.data) {
          setPricingLists(pricingResponse.data.pricingLists);
        } else {
          showSnackbar(pricingResponse.message ?? UNEXPECTED_ERROR, 'error');
        }

        if (carrierResponse.status === 'OK' && carrierResponse.data) {
          setCarrierAccountsData(carrierResponse.data);
        } else {
          showSnackbar(carrierResponse.message ?? UNEXPECTED_ERROR, 'error');
        }
      } catch (error) {
        console.error('Failed to load edit user data:', error);

        showSnackbar(UNEXPECTED_ERROR, 'error');
      }
    };

    loadData();
  }, [open]);

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              backgroundImage: 'none',
              backgroundColor: theme.palette.dashboard.sidebar,
            },
          },
        }}
      >
        <DialogTitle>Üyeyi Düzenle</DialogTitle>

        <DialogContent dividers>
          <FormItems control={control} errors={errors} pricingLists={pricingLists} carrierAccounts={carrierAccountsData?.carrierAccounts || []} />
        </DialogContent>

        <DialogActions sx={{ m: 2 }}>
          <Button onClick={onClose}>İptal</Button>

          <StyledButton variant="contained" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            Kaydet
          </StyledButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditUser;
