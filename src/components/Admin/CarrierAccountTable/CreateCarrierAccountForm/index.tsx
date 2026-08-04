import React, { useEffect, useState, useTransition } from 'react';

import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, useTheme } from '@mui/material';
import { useForm } from 'react-hook-form';

import createCarrierAccount from '@/app/actions/admin/createCarrierAccount';
import StyledButton from '@/components/StyledButton';
import { carrierMessages, generalMessages } from '@/constants';
import { CarrierAccountTypes } from '@/types/carrierAccount';
import { Carrier } from '@/constants';
import FormItems from './FormItems';

type CreateCarrierAccountProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

const { CREATE } = carrierMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const CreateCarrierAccountForm = ({ open, onClose, onSuccess }: CreateCarrierAccountProps) => {
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
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CarrierAccountTypes.ICreateCarrierAccountPayload>({
    defaultValues: {
      name: '',
      accountNumber: '',
      carrier: Carrier.FEDEX,
      credentials: [
        { key: 'apiKey', value: '' },
        { key: 'secretKey', value: '' },
      ],
      hasCustomInfo: false,
      customInfo: {
        firstName: '',
        lastName: '',
        email: '',
        company: '',
        phone: '',
        address: {
          line1: '',
          line2: '',
          city: '',
          district: '',
          postalCode: '',
        },
      },
    },
  });

  const selectedCarrier = watch('carrier');
  const hasCustomInfo = watch('hasCustomInfo');

  useEffect(() => {
    if (selectedCarrier === Carrier.FEDEX) {
      setValue('credentials', [
        { key: 'apiKey', value: '' },
        { key: 'secretKey', value: '' },
      ]);
    } else if (selectedCarrier === Carrier.UPS) {
      setValue('credentials', [
        { key: 'clientId', value: '' },
        { key: 'clientSecret', value: '' },
      ]);
    }
  }, [selectedCarrier, setValue]);

  const onSubmit = (data: CarrierAccountTypes.ICreateCarrierAccountPayload) => {
    startTransition(async () => {
      const response = await createCarrierAccount(data);

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
        severity: 'success',
        message: response.message ?? CREATE.SUCCESS,
      });

      reset();
      onSuccess?.();
      onClose();
    });
  };

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const credentials = watch('credentials');
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
        <form>
          <DialogTitle>Kargo Hesabı Oluştur</DialogTitle>
          <DialogContent>
            <FormItems control={control} setValue={setValue} credentials={credentials} hasCustomInfo={hasCustomInfo} errors={errors} />
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={onClose} color="inherit" disabled={isPending}>
              İptal
            </Button>
            <StyledButton type="button" onClick={handleSubmit(onSubmit)} variant="contained" loading={isPending}>
              Kaydet
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

export default CreateCarrierAccountForm;
