import React, { useState } from 'react';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { Grid, IconButton, InputAdornment, TextField } from '@mui/material';
import { Control, Controller, FieldErrors, UseFormSetValue } from 'react-hook-form';

import { captchaMessages, userMessages } from '@/constants';

import PersonalInfoFields from './PersonalInfoFields';
import ContactFields from './ContactFields';
import AddressFields from './AddressFields';

import HCaptchaField from '../../HCaptcha';

const { PASSWORD } = userMessages;

type FormItemsProps = {
  errors: FieldErrors<AuthTypes.ISignUpPayload>;
  control: Control<AuthTypes.ISignUpPayload, AuthTypes.ISignUpPayload>;
  setValue: UseFormSetValue<AuthTypes.ISignUpPayload>;
  captchaKey: number;
};

const FormFields = ({ errors, control, setValue, captchaKey }: FormItemsProps) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <Grid container spacing={2}>
      <PersonalInfoFields control={control} errors={errors} />

      <ContactFields control={control} errors={errors} />

      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="password"
          control={control}
          rules={{
            required: PASSWORD.REQUIRED,
            minLength: { value: 8, message: PASSWORD.MIN },
            maxLength: { value: 255, message: PASSWORD.MAX },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Parola"
              required
              autoComplete="new-password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              error={!!errors.password}
              helperText={errors.password?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mr: 1 }}>
                      <LockOutlinedIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPassword(p => !p)}>
                        {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />
      </Grid>

      <AddressFields control={control} errors={errors} />

      <Grid size={{ xs: 12 }}>
        <Controller
          key={captchaKey}
          name="recaptchaToken"
          control={control}
          rules={{ required: captchaMessages.REQUIRED }}
          render={() => <HCaptchaField onVerify={token => setValue('recaptchaToken', token)} onExpire={() => setValue('recaptchaToken', '')} />}
        />
      </Grid>
    </Grid>
  );
};

export default FormFields;
