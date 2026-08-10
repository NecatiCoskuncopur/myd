'use client';

import { IconButton, InputAdornment, TextField } from '@mui/material';
import { Control, Controller, FieldErrors, Path } from 'react-hook-form';
import React, { useState } from 'react';
import { userMessages } from '@/constants';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

type PasswordFieldData = {
  password: string;
};

type PasswordFieldProps<T extends PasswordFieldData> = {
  errors: FieldErrors<PasswordFieldData>;
  control: Control<T>;
};

const { PASSWORD } = userMessages;

const PasswordField = <T extends PasswordFieldData>({ errors, control }: PasswordFieldProps<T>) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <Controller
      name={'password' as Path<T>}
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
  );
};

export default PasswordField;
