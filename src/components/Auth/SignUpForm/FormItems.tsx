import React from 'react';

import { Grid } from '@mui/material';
import { Control, FieldErrors, UseFormSetValue } from 'react-hook-form';

import { AddressFields, CaptchaField, ContactFields, PasswordField, PersonalFields, TaxFields } from '@/components';

type FormItemsProps = {
  errors: FieldErrors<AuthTypes.ISignUpPayload>;
  control: Control<AuthTypes.ISignUpPayload, AuthTypes.ISignUpPayload>;
  setValue: UseFormSetValue<AuthTypes.ISignUpPayload>;
  captchaKey: number;
};

const FormItems = ({ errors, control, setValue, captchaKey }: FormItemsProps) => {
  return (
    <Grid container spacing={2}>
      <PersonalFields control={control} errors={errors} />
      <ContactFields control={control} errors={errors} />
      <Grid size={{ xs: 12, md: 6 }}>
        <PasswordField errors={errors} control={control} />
      </Grid>
      <TaxFields errors={errors} control={control} />
      <AddressFields control={control} errors={errors} />
      <CaptchaField captchaKey={captchaKey} control={control} onCaptchaChange={token => setValue('recaptchaToken', token)} />
    </Grid>
  );
};

export default FormItems;
