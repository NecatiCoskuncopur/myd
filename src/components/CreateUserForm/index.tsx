'use client';

import { Box } from '@mui/material';
import { useForm } from 'react-hook-form';

import adminCreateUser from '@/app/actions/admin/adminCreateUser';
import { StyledButton } from '@/components';
import { authMessages, generalMessages } from '@/constants';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { AdminTypes } from '@/types/admin';

import FormItems from './FormItems';

interface CreateUserFormProps {
  onSuccess?: (user: AdminTypes.ISearchSenderResult) => void;
}

const CreateUserForm = ({ onSuccess }: CreateUserFormProps) => {
  const { showSnackbar } = useSnackbar();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminTypes.ICreateUser>({
    defaultValues: {
      firstName: '',
      lastName: '',
      company: '',
      taxId: '',
      taxOffice: '',
      phone: '',
      email: '',
      password: '',
      nickname: '',
      address: {
        line1: '',
        district: '',
        city: '',
        postalCode: '',
      },
    },
  });

  const onSubmit = async (values: AdminTypes.ICreateUser) => {
    try {
      const response = await adminCreateUser(values);

      if (response.status === 'ERROR') {
        showSnackbar(response.message ?? authMessages.SIGNUP.ERROR, 'error');
        return;
      }

      if (response.data) {
        onSuccess?.(response.data);
      }
    } catch {
      showSnackbar(generalMessages.UNEXPECTED_ERROR, 'error');
    }
  };
  return (
    <Box component="div">
      <FormItems errors={errors} control={control} />

      <StyledButton
        type="button"
        variant="contained"
        size="large"
        fullWidth
        onClick={handleSubmit(onSubmit)}
        sx={{ mt: 4 }}
        disabled={isSubmitting}
        loading={isSubmitting}
      >
        Kaydet ve Seç
      </StyledButton>
    </Box>
  );
};

export default CreateUserForm;
