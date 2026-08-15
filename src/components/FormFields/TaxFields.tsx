'use client';

import { Grid, InputAdornment, TextField } from '@mui/material';
import { Control, Controller, FieldErrors, Path } from 'react-hook-form';
import React from 'react';
import { userMessages } from '@/constants';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';

type TaxFieldsData = {
  taxId?: string;
  taxOffice?: string;
};

type TaxFieldsProps<T extends TaxFieldsData> = {
  errors: FieldErrors<TaxFieldsData>;
  control: Control<T>;
};

const { TAXID, TAXOFFICE } = userMessages;

const TaxFields = <T extends TaxFieldsData>({ errors, control }: TaxFieldsProps<T>) => {
  return (
    <>
      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name={'taxId' as Path<T>}
          control={control}
          rules={{
            validate: value => {
              if (!value) return true;
              if (value.length > 20) return TAXID.MAX;
              return true;
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Vergi Numarası"
              value={field.value ?? ''}
              fullWidth
              error={!!errors.taxId}
              helperText={errors.taxId?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mr: 1 }}>
                      <ReceiptLongOutlinedIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name={'taxOffice' as Path<T>}
          control={control}
          rules={{
            validate: value => {
              if (!value) return true;
              if (value.length > 75) return TAXOFFICE.MAX;
              return true;
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Vergi Dairesi"
              fullWidth
              value={field.value ?? ''}
              error={!!errors.taxOffice}
              helperText={errors.taxOffice?.message}
              onChange={e => {
                field.onChange(e);
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mr: 1 }}>
                      <AccountBalanceOutlinedIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />
      </Grid>
    </>
  );
};

export default TaxFields;
