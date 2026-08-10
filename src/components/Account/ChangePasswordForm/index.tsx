'use client';

import { useState } from 'react';

import { Box, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';

import changePassword from '@/app/actions/user/changePassword';
import StyledButton from '@/components/StyledButton';
import { userMessages } from '@/constants';
import FormItems from './FormItems';
import { UserTypes } from '@/types/user';
import { useSnackbar } from '@/providers/SnackbarProvider';

const { PASSWORD } = userMessages;

const ChangePasswordForm = () => {
  const [loading, setLoading] = useState(false);
  const { showSnackbar } = useSnackbar();

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

      showSnackbar(response.message || PASSWORD.SUCCESS, response.status === 'OK' ? 'success' : 'error');

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
    </>
  );
};

export default ChangePasswordForm;
