import React from 'react';

import { Grid } from '@mui/material';
import { FieldErrors, UseFormRegister } from 'react-hook-form';

import { UserTypes } from '@/types/user';
import PersonalInfoFields from './PersonalInfoFields';
import ContactFields from './ContactFields';
import AddressFields from './AddressFields';

type FormFieldsProps = {
  errors: FieldErrors<UserTypes.IEditUserPayload>;
  register: UseFormRegister<UserTypes.IEditUserPayload>;
  pending: boolean;
};

const FormFields = ({ errors, register, pending }: FormFieldsProps) => {
  return (
    <Grid container spacing={3}>
      <PersonalInfoFields errors={errors} register={register} pending={pending} />
      <ContactFields errors={errors} register={register} pending={pending} />
      <AddressFields errors={errors} register={register} pending={pending} />
    </Grid>
  );
};

export default FormFields;
