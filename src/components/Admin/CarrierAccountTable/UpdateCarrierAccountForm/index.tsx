import React, { useEffect, useState, useTransition } from 'react';

import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, useTheme } from '@mui/material';
import { useForm, useWatch } from 'react-hook-form';

import updateCarrierAccount from '@/app/actions/admin/updateCarrierAccount';
import StyledButton from '@/components/StyledButton';
import { carrierMessages, generalMessages } from '@/constants';
import { CarrierAccountTypes } from '@/types/carrierAccount';
import FormItems from './FormItems';
import getCarrierCredentials from '@/lib/getCarrierCredentials';

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
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

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
        accountNumber: account.accountNumber,
        carrier: account.carrier,
        credentials: account.credentials,
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
        setSnackbar({
          open: true,
          severity: 'error',
          message: response.message ?? UNEXPECTED_ERROR,
        });
        return;
      }
      setSnackbar({
        open: true,
        message: response.message ?? UPDATE.SUCCESS,
        severity: 'success',
      });

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
            <FormItems control={control} setValue={setValue} credentials={credentials} hasCustomInfo={hasCustomInfo} errors={errors} account={account} />
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() =>
          setSnackbar(prev => ({
            ...prev,
            open: false,
          }))
        }
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UpdateCarrierAccountForm;
