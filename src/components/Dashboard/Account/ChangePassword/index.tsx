'use client';

import { useState, useTransition } from 'react';

import { Alert, Box, Button, Snackbar, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';

import changePassword from '@/app/actions/user/changePassword';
import { messages } from '@/constants';
import FormItems from './FormItems';

const { GENERAL, PASSWORD } = messages;

const ChangePasswordForm = () => {
  const [pending, startTransition] = useTransition();
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
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IChangePasswordFormUI>();

  const onSubmit = (values: IChangePasswordFormUI) => {
    if (values.newPassword !== values.newPasswordRepeat) {
      setSnackbar({ open: true, message: PASSWORD.DO_NOT_MATCH, severity: 'error' });
      return;
    }

    startTransition(async () => {
      try {
        const response = await changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });

        if (response.status === 'ERROR') {
          setSnackbar({
            open: true,
            message: response.message || GENERAL.UNEXPECTED_ERROR,
            severity: 'error',
          });
          return;
        }
        setSnackbar({ open: true, message: PASSWORD.SUCCESS, severity: 'success' });
        reset();
      } catch (error: unknown) {
        const err = error as Error;
        setSnackbar({ open: true, message: err.message || GENERAL.UNEXPECTED_ERROR, severity: 'error' });
      }
    });
  };

  return (
    <>
      <Typography variant="h5" sx={{ mb: 4, fontWeight: 500 }}>
        Parola Değiştir
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormItems register={register} errors={errors} pending={pending} />
        <Button
          type="submit"
          variant="contained"
          size="large"
          sx={{
            mt: 3,
            p: '10px 22px',
            backgroundColor: '#5F4AFE',
            color: '#FFFFFF',
            float: 'right',
            '&:hover': {
              backgroundColor: '#4C3BCB',
            },
          }}
          loading={pending}
        >
          Parolayı Güncelle
        </Button>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ChangePasswordForm;
