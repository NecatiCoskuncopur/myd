import React, { useEffect, useTransition } from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, useTheme } from '@mui/material';
import { useForm, useWatch } from 'react-hook-form';

import updateCarrierAccount from '@/app/actions/admin/updateCarrierAccount';
import { StyledButton } from '@/components';
import { carrierMessages, generalMessages } from '@/constants';
import { CarrierAccountTypes } from '@/types/carrierAccount';
import FormItems from './FormItems';
import getCarrierCredentials from '@/lib/getCarrierCredentials';
import { useSnackbar } from '@/providers/SnackbarProvider';

type UpdateCarrierAccountProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  account: CarrierAccountTypes.ICarrierAccount | null;
};

const { UPDATE } = carrierMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const UpdateCarrierAccountForm = ({ open, onClose, onSuccess, account }: UpdateCarrierAccountProps) => {
  const theme = useTheme();
  const [isPending, startTransition] = useTransition();
  const { showSnackbar } = useSnackbar();

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CarrierAccountTypes.IUpdateCarrierAccountPayload>();

  useEffect(() => {
    if (account && open) {
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
    }
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
    if (account?.carrier !== selectedCarrier && selectedCarrier) {
      setValue('credentials', getCarrierCredentials(selectedCarrier));
    }
  }, [selectedCarrier, account?.carrier, setValue]);

  const onSubmit = (data: CarrierAccountTypes.IUpdateCarrierAccountPayload) => {
    startTransition(async () => {
      const response = await updateCarrierAccount(data);

      if (response.status === 'ERROR') {
        showSnackbar(response.message ?? UNEXPECTED_ERROR, 'error');
        return;
      }
      showSnackbar(response.message ?? UPDATE.SUCCESS, 'success');

      onSuccess?.();
      onClose();
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: { sx: { backgroundImage: 'none', backgroundColor: theme.palette.dashboard.sidebar } },
        }}
      >
        <form>
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
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleClose} color="inherit">
              İptal
            </Button>
            <StyledButton type="button" onClick={handleSubmit(onSubmit)} variant="contained" loading={isPending}>
              Güncelle
            </StyledButton>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default UpdateCarrierAccountForm;
