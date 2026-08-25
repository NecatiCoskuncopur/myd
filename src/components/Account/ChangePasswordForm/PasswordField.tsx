'use client';

import { useState } from 'react';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { IconButton, InputAdornment, TextField, TextFieldProps } from '@mui/material';

type PasswordFieldProps = TextFieldProps;

const PasswordField = (props: PasswordFieldProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleTogglePassword = () => {
    setIsPasswordVisible(prev => !prev);
  };

  return (
    <TextField
      {...props}
      type={isPasswordVisible ? 'text' : 'password'}
      fullWidth
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <LockOutlinedIcon />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton type="button" edge="end" aria-label={isPasswordVisible ? 'Parolayı gizle' : 'Parolayı göster'} onClick={handleTogglePassword}>
                {isPasswordVisible ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default PasswordField;
