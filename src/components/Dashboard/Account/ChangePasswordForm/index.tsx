'use client';

import { useState, useTransition } from 'react';

import { Alert, Box, Snackbar, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';

import changePassword from '@/app/actions/user/changePassword';
import StyledButton from '@/components/StyledButton';
import { generalMessages, userMessages } from '@/constants';
import FormItems from './FormItems';

const { PASSWORD } = userMessages;
const { UNEXPECTED_ERROR } = generalMessages;

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
  } = useForm<UserTypes.IChangePasswordFormUI>();

  const onSubmit = (values: UserTypes.IChangePasswordFormUI) => {
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
            message: response.message || UNEXPECTED_ERROR,
            severity: 'error',
          });
          return;
        }
        setSnackbar({ open: true, message: PASSWORD.SUCCESS, severity: 'success' });
        reset();
      } catch (error: unknown) {
        const err = error as Error;
        setSnackbar({ open: true, message: err.message || UNEXPECTED_ERROR, severity: 'error' });
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
        <StyledButton
          type="submit"
          variant="contained"
          sx={{
            mt: 3,
            float: 'right',
          }}
          loading={pending}
        >
          Parolayı Güncelle
        </StyledButton>
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
