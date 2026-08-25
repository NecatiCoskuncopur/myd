'use client';

import BankOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import { Grid, InputAdornment, TextField } from '@mui/material';
import { Control, Controller, FieldErrors, Path } from 'react-hook-form';

import { userMessages } from '@/constants';

type PersonalFieldsData = {
  firstName: string;
  lastName: string;
  company?: string;
};

type PersonalFieldsProps<T extends PersonalFieldsData> = {
  errors: FieldErrors<PersonalFieldsData>;
  control: Control<T>;
};

const { COMPANY, FIRSTNAME, LASTNAME } = userMessages;

const PersonalFields = <T extends PersonalFieldsData>({ errors, control }: PersonalFieldsProps<T>) => {
  return (
    <>
      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name={'firstName' as Path<T>}
          control={control}
          rules={{
            required: FIRSTNAME.REQUIRED,
            minLength: { value: 2, message: FIRSTNAME.MIN },
            maxLength: { value: 75, message: FIRSTNAME.MAX },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Ad"
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlinedIcon />
                    </InputAdornment>
                  ),
                },
              }}
              required
              fullWidth
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name={'lastName' as Path<T>}
          control={control}
          rules={{
            required: LASTNAME.REQUIRED,
            minLength: { value: 2, message: LASTNAME.MIN },
            maxLength: { value: 75, message: LASTNAME.MAX },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Soyad"
              slotProps={{
                inputLabel: {
                  shrink: true,
                },

                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeOutlinedIcon />
                    </InputAdornment>
                  ),
                },
              }}
              required
              fullWidth
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name={'company' as Path<T>}
          rules={{
            validate: value => {
              if (!value) return true;
              if (value.length < 5) return COMPANY.MIN;
              if (value.length > 75) return COMPANY.MAX;
              return true;
            },
          }}
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Firma İsmi"
              error={!!errors.company}
              helperText={errors.company?.message}
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mr: 1 }}>
                      <BankOutlinedIcon />
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

export default PersonalFields;
