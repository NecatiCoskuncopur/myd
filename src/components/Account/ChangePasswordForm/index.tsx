'use client';

import { Box, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';

import changePassword from '@/app/actions/user/changePassword';
import StyledButton from '@/components/StyledButton';
import { userMessages } from '@/constants';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { UserTypes } from '@/types/user';

import FormItems from './FormItems';

const { PASSWORD } = userMessages;

const ChangePasswordForm = () => {
  const { showSnackbar } = useSnackbar();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserTypes.IChangePasswordFormUI>();

  const onSubmit = async ({ currentPassword, newPassword }: UserTypes.IChangePasswordFormUI) => {
    const response = await changePassword({
      currentPassword,
      newPassword,
    });

    const isSuccess = response.status === 'OK';

    showSnackbar(response.message || PASSWORD.SUCCESS, isSuccess ? 'success' : 'error');

    if (isSuccess) {
      reset();
    }
  };

  return (
    <>
      <Typography variant="h5" sx={{ mb: 4, fontWeight: 500 }}>
        Parola Değiştir
      </Typography>

      <Box component="form" noValidate>
        <FormItems register={register} errors={errors} pending={isSubmitting} />
        <StyledButton
          type="button"
          disabled={isSubmitting}
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          sx={{
            mt: 3,
            float: 'right',
          }}
          loading={isSubmitting}
        >
          Parolayı Güncelle
        </StyledButton>
      </Box>
    </>
  );
};

export default ChangePasswordForm;
