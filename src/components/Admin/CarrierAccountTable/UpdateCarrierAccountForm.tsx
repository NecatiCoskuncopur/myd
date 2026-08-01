import React, { useEffect, useState, useTransition } from 'react';

import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Snackbar, TextField, useTheme } from '@mui/material';
import { Controller, useForm, useWatch } from 'react-hook-form';

import updateCarrierAccount from '@/app/actions/admin/updateCarrierAccount';
import StyledButton from '@/components/StyledButton';
import { carrierMessages, generalMessages } from '@/constants';
import { CarrierAccountTypes } from '@/types/carrierAccount';

type UpdateCarrierAccountProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  account: CarrierAccountTypes.ICarrierAccount | null;
};

const { ACCOUNTNUMBER, UPDATE, NAME } = carrierMessages;
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

  useEffect(() => {
    if (account?.carrier !== selectedCarrier) {
      const newCreds =
        selectedCarrier === 'FEDEX'
          ? [
              { key: 'apiKey', value: '' },
              { key: 'secretKey', value: '' },
            ]
          : [
              { key: 'clientId', value: '' },
              { key: 'clientSecret', value: '' },
            ];
      setValue('credentials', newCreds);
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
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: NAME.REQUIRED }}
                  render={({ field }) => <TextField {...field} fullWidth label="Hesap Adı" error={!!errors.name} helperText={errors.name?.message} />}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="accountNumber"
                  control={control}
                  rules={{ required: ACCOUNTNUMBER.REQUIRED }}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="Hesap Numarası" error={!!errors.accountNumber} helperText={errors.accountNumber?.message} />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Hesap Durumu"
                      value={field.value ? 'true' : 'false'}
                      onChange={e => field.onChange(e.target.value === 'true')}
                      error={!!errors.isActive}
                      helperText={errors.isActive?.message}
                    >
                      <MenuItem value="true">Aktif</MenuItem>
                      <MenuItem value="false">Pasif</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="carrier"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select fullWidth label="Kargo Firması">
                      <MenuItem value="FEDEX">FedEx</MenuItem>
                      <MenuItem value="UPS">UPS</MenuItem>
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
                          render={({ field }) => <TextField {...field} fullWidth label={item.key} error={!!errors.credentials?.[index]?.value} />}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Grid>
            </Grid>
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
