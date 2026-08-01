import React, { useEffect, useState, useTransition } from 'react';

import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Snackbar, TextField, useTheme } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';

import createCarrierAccount from '@/app/actions/admin/createCarrierAccount';
import StyledButton from '@/components/StyledButton';
import { carrierMessages, generalMessages } from '@/constants';
import { CarrierAccountTypes } from '@/types/carrierAccount';
import { Carrier } from '@/constants';

type CreateCarrierAccountProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

const { ACCOUNTNUMBER, CREATE, NAME } = carrierMessages;
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
    },
  });

  const selectedCarrier = watch('carrier');

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
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="name"
                  rules={{
                    required: NAME.REQUIRED,
                    minLength: { value: 2, message: NAME.MIN },
                    maxLength: { value: 75, message: NAME.MAX },
                  }}
                  control={control}
                  render={({ field }) => <TextField {...field} fullWidth label="Hesap Adı" error={!!errors.name} helperText={errors.name?.message} />}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="accountNumber"
                  rules={{
                    required: ACCOUNTNUMBER.REQUIRED,
                    minLength: { value: 1, message: ACCOUNTNUMBER.MIN },
                  }}
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="Hesap Numarası" error={!!errors.accountNumber} helperText={errors.accountNumber?.message} />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Controller
                  name="carrier"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select fullWidth label="Kargo Firması" error={!!errors.carrier}>
                      <MenuItem value={Carrier.FEDEX}>FedEx</MenuItem>
                      <MenuItem value={Carrier.UPS}>UPS</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box sx={{ p: 2, border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 1 }}>
                  <Grid container spacing={2}>
                    {credentials?.map((item, index) => (
                      <Grid size={{ xs: 12, md: 6 }} key={item.key}>
                        <Controller
                          name={`credentials.${index}.value` as const}
                          control={control}
                          rules={{ required: 'Bu alan zorunludur' }}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label={item.key === 'apiKey' ? 'API Key' : item.key === 'secretKey' ? 'Secret Key' : item.key}
                              error={!!errors.credentials?.[index]?.value}
                              helperText={errors.credentials?.[index]?.value?.message}
                            />
                          )}
                        />
                        <Controller name={`credentials.${index}.key` as const} control={control} render={({ field }) => <input type="hidden" {...field} />} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Grid>
            </Grid>
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
