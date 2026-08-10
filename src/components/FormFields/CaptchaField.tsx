'use client';

import { Grid } from '@mui/material';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import React from 'react';
import { captchaMessages } from '@/constants';
import { HCaptcha } from '@/components';

type CaptchaFieldProps<T extends FieldValues & { recaptchaToken: string }> = {
  captchaKey: number;
  control: Control<T>;
  onCaptchaChange: (token: string) => void;
};

const CaptchaField = <T extends FieldValues & { recaptchaToken: string }>({ captchaKey, control, onCaptchaChange }: CaptchaFieldProps<T>) => {
  return (
    <Grid size={{ xs: 12 }}>
      <Controller
        key={captchaKey}
        name={'recaptchaToken' as FieldPath<T>}
        control={control}
        rules={{
          required: captchaMessages.REQUIRED,
        }}
        render={() => <HCaptcha onVerify={onCaptchaChange} onExpire={() => onCaptchaChange('')} />}
      />
    </Grid>
  );
};

export default CaptchaField;
