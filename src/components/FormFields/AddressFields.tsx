'use client';

import { Grid, InputAdornment, TextField } from '@mui/material';
import { Control, Controller, FieldErrors, Path } from 'react-hook-form';
import React from 'react';
import { addressMessages } from '@/constants';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import LocationCityOutlinedIcon from '@mui/icons-material/LocationCityOutlined';
import MarkunreadMailboxOutlinedIcon from '@mui/icons-material/MarkunreadMailboxOutlined';

type AddressFieldsData = {
  line1: string;
  line2?: string;
  district: string;
  city: string;
  postalCode: string;
};

type AddressFormData = {
  address: AddressFieldsData;
};

type AddressFieldsProps<T extends AddressFormData> = {
  errors: FieldErrors<AddressFormData>;
  control: Control<T>;
};

const { CITY, DISTRICT, LINE, POSTALCODE } = addressMessages;

const AddressFields = <T extends AddressFormData>({ errors, control }: AddressFieldsProps<T>) => {
  return (
    <>
      <Grid size={{ xs: 12 }}>
        <Controller
          name={'address.line1' as Path<T>}
          control={control}
          rules={{
            required: LINE.REQUIRED,
            minLength: { value: 5, message: LINE.MIN },
            maxLength: { value: 255, message: LINE.MAX },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Adres"
              fullWidth
              required
              error={!!errors.address?.line1}
              helperText={errors.address?.line1?.message}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnOutlinedIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Controller
          name={'address.line2' as Path<T>}
          control={control}
          rules={{
            validate: value => {
              const val = value as string | undefined;
              if (!val) return true;
              if (val.length > 255) return LINE.MAX;
              return true;
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Adres Satırı 2"
              value={field.value ?? ''}
              fullWidth
              error={!!errors.address?.line2}
              helperText={errors.address?.line2?.message}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnOutlinedIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Controller
          name={'address.district' as Path<T>}
          control={control}
          rules={{
            required: DISTRICT.REQUIRED,
            minLength: { value: 2, message: DISTRICT.MIN },
            maxLength: { value: 25, message: DISTRICT.MAX },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="İlçe"
              required
              fullWidth
              error={!!errors.address?.district}
              helperText={errors.address?.district?.message}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },

                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <MapOutlinedIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Controller
          name={'address.city' as Path<T>}
          control={control}
          rules={{
            required: CITY.REQUIRED,
            minLength: { value: 2, message: CITY.MIN },
            maxLength: { value: 35, message: CITY.MAX },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="İl"
              required
              fullWidth
              error={!!errors.address?.city}
              helperText={errors.address?.city?.message}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },

                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationCityOutlinedIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Controller
          name={'address.postalCode' as Path<T>}
          control={control}
          rules={{
            required: POSTALCODE.REQUIRED,

            validate: value => {
              const val = value as string;
              return val.length === 5 || POSTALCODE.LENGTH;
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Posta Kodu"
              required
              fullWidth
              error={!!errors.address?.postalCode}
              helperText={errors.address?.postalCode?.message}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <MarkunreadMailboxOutlinedIcon />
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

export default AddressFields;
