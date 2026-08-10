'use client';

import { Grid, InputAdornment, TextField } from '@mui/material';
import { Control, Controller, FieldErrors, Path } from 'react-hook-form';
import React from 'react';
import { userMessages } from '@/constants';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';

type NickNameFieldData = {
  nickname?: string;
};

type NickNameFieldProps<T extends NickNameFieldData> = {
  errors: FieldErrors<T>;
  control: Control<T>;
};

const { NICKNAME } = userMessages;

const NickNameField = <T extends NickNameFieldData>({ errors, control }: NickNameFieldProps<T>) => {
  return (
    <Grid size={{ xs: 12, md: 6 }}>
      <Controller
        name={'nickname' as Path<T>}
        control={control}
        rules={{
          validate: value => {
            if (!value) return true;
            if (value.length < 4) return NICKNAME.MIN;
            if (value.length > 75) return NICKNAME.MAX;
            return true;
          },
        }}
        render={({ field }) => (
          <TextField
            {...field}
            label="Kullanıcı Adı"
            fullWidth
            error={!!errors.nickname}
            helperText={errors.nickname?.message as string}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeOutlinedIcon />
                  </InputAdornment>
                ),
              },
            }}
          />
        )}
      />
    </Grid>
  );
};

export default NickNameField;
