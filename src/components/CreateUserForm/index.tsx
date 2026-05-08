'use client';

import React, { useState, useTransition } from 'react';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Alert, Box, CircularProgress } from '@mui/material';
import { useForm } from 'react-hook-form';

import adminCreateUser from '@/app/actions/admin/adminCreateUser';
import { StyledButton } from '@/components';
import { authMessages, generalMessages } from '@/constants';
import FormItems from './FormItems';

interface CreateUserFormProps {
  onSuccess?: (user: AdminTypes.ISearchSenderResult) => void;
}

const CreateUserForm = ({ onSuccess }: CreateUserFormProps) => {
  const [pending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminTypes.ICreateUser>({
    defaultValues: {
      firstName: '',
      lastName: '',
      company: '',
      phone: '',
      email: '',
      password: '',
      address: {
        line1: '',
        district: '',
        city: '',
        postalCode: '',
      },
    },
  });

  const onSubmit = (values: AdminTypes.ICreateUser, e?: React.BaseSyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setErrorMessage(null);

    startTransition(async () => {
      try {
        const response = await adminCreateUser(values);

        if (response.status === 'ERROR') {
          setErrorMessage(response.message ?? authMessages.SIGNUP.ERROR);
          return;
        }

        if (onSuccess && response.data) {
          onSuccess(response.data as AdminTypes.ISearchSenderResult);
        }
      } catch {
        setErrorMessage(generalMessages.UNEXPECTED_ERROR);
      }
    });
  };

  return (
    <>
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      <Box component="div">
        <FormItems errors={errors} control={control} />

        <StyledButton
          type="button"
          variant="contained"
          size="large"
          fullWidth
          onClick={handleSubmit(onSubmit)}
          sx={{ mt: 4 }}
          startIcon={pending ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
          disabled={pending}
        >
          {pending ? 'Kaydediliyor...' : 'Kaydet ve Seç'}
        </StyledButton>
      </Box>
    </>
  );
};

export default CreateUserForm;
