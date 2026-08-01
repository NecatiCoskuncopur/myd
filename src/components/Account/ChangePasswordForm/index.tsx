'use client';

import { useState } from 'react';

import { Alert, Box, Snackbar, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';

import changePassword from '@/app/actions/user/changePassword';
import StyledButton from '@/components/StyledButton';
import { userMessages } from '@/constants';
import FormItems from './FormItems';
import { UserTypes } from '@/types/user';

const { PASSWORD } = userMessages;

const ChangePasswordForm = () => {
  const [loading, setLoading] = useState(false);
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

  const onSubmit = async (values: UserTypes.IChangePasswordFormUI) => {
    setLoading(true);

    try {
      const response = await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      setSnackbar({
        open: true,
        message: response.message || PASSWORD.SUCCESS,
        severity: response.status === 'OK' ? 'success' : 'error',
      });

      if (response.status === 'OK') {
        reset();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Typography variant="h5" sx={{ mb: 4, fontWeight: 500 }}>
        Parola Değiştir
      </Typography>

      <Box component="form" noValidate>
        <FormItems register={register} errors={errors} pending={loading} />
        <StyledButton
          type="button"
          disabled={loading}
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          sx={{
            mt: 3,
            float: 'right',
          }}
          loading={loading}
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
