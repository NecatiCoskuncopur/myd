import React, { useState } from 'react';

import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { Grid, IconButton, InputAdornment, TextField } from '@mui/material';
import { Control, Controller, FieldErrors } from 'react-hook-form';

import { userMessages } from '@/constants';
import { AdminTypes } from '@/types/admin';
import PersonalInfoFields from './PersonalInfoFields';
import ContactFields from './ContactFields';
import AddressFields from './AddressFields';

const { PASSWORD } = userMessages;

type FormFieldsProps = {
  errors: FieldErrors<AdminTypes.ICreateUser>;
  control: Control<AdminTypes.ICreateUser, AdminTypes.ICreateUser>;
};

const FormFields = ({ errors, control }: FormFieldsProps) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <Grid container spacing={2}>
      <PersonalInfoFields control={control} errors={errors} />
      <ContactFields control={control} errors={errors} />

      <Grid size={{ xs: 12 }}>
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
              autoComplete="new-password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              required
              error={!!errors.password}
              helperText={errors.password?.message}
              slotProps={{
                input: {
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
    </Grid>
  );
};

export default FormFields;
