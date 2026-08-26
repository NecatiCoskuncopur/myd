'use client';

import { useEffect, useRef } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useForm, useWatch } from 'react-hook-form';

import updateCarrierAccount from '@/app/actions/admin/updateCarrierAccount';
import { StyledButton } from '@/components';
import { Carrier, carrierMessages, generalMessages } from '@/constants';
import getCarrierCredentials from '@/lib/getCarrierCredentials';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { CarrierAccountTypes } from '@/types/carrierAccount';

import FormItems from './FormItems';

type UpdateCarrierAccountProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  account: CarrierAccountTypes.ICarrierAccount | null;
};

const { UPDATE } = carrierMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const UpdateCarrierAccountForm = ({ open, onClose, onSuccess, account }: UpdateCarrierAccountProps) => {
  const { showSnackbar } = useSnackbar();

  const previousCarrierRef = useRef<Carrier | undefined>(undefined);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CarrierAccountTypes.IUpdateCarrierAccountPayload>();

  useEffect(() => {
    if (!account || !open) {
      return;
    }

    previousCarrierRef.current = account.carrier;

    reset({
      id: account._id,
      name: account.name,
      displayName: account.displayName,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      carrier: account.carrier,
      credentials: account.credentials,
      pricing: account.pricing,
      isActive: account.isActive,
      hasCustomInfo: account.hasCustomInfo,
      customInfo: account.customInfo,
    });
  }, [account, open, reset]);

  const credentials = useWatch({
    control,
    name: 'credentials',
  });

  const selectedCarrier = useWatch({
    control,
    name: 'carrier',
  });

  const hasCustomInfo = useWatch({
    control,
    name: 'hasCustomInfo',
  });

  useEffect(() => {
    if (!selectedCarrier) {
      return;
    }

    const previousCarrier = previousCarrierRef.current;

    if (previousCarrier && previousCarrier !== selectedCarrier) {
      setValue('credentials', getCarrierCredentials(selectedCarrier));
    }

    previousCarrierRef.current = selectedCarrier;
  }, [selectedCarrier, setValue]);

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    previousCarrierRef.current = undefined;

    reset();
    onClose();
  };

  const onSubmit = async (data: CarrierAccountTypes.IUpdateCarrierAccountPayload) => {
    try {
      const response = await updateCarrierAccount(data);

      if (response.status === 'ERROR') {
        showSnackbar(response.message ?? UNEXPECTED_ERROR, 'error');

        return;
      }

      showSnackbar(response.message ?? UPDATE.SUCCESS, 'success');

      previousCarrierRef.current = undefined;

      reset();

      onSuccess?.();
      onClose();
    } catch {
      showSnackbar(UNEXPECTED_ERROR, 'error');
    }
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
      <DialogTitle>Kargo Hesabını Düzenle</DialogTitle>

      <DialogContent>
        <FormItems
          mode="update"
          control={control}
          setValue={setValue}
          credentials={credentials}
          hasCustomInfo={hasCustomInfo}
          errors={errors}
          account={account}
        />
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
        }}
      >
        <Button type="button" onClick={handleClose} color="inherit" disabled={isSubmitting}>
          İptal
        </Button>

        <StyledButton type="button" onClick={handleSubmit(onSubmit)} variant="contained" loading={isSubmitting} disabled={isSubmitting}>
          Güncelle
        </StyledButton>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateCarrierAccountForm;
