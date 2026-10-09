import { Box, Grid, TextField, useTheme } from '@mui/material';
import { Control, Controller, FieldErrors, Path } from 'react-hook-form';

import { addressMessages, userMessages } from '@/constants';
import { CarrierAccountTypes } from '@/types/carrierAccount';

const { CITY, DISTRICT, LINE, POSTALCODE } = addressMessages;
const { COMPANY, EMAIL, FULLNAME, PHONE } = userMessages;

type CustomInfoSectionProps<T extends { customInfo?: Partial<CarrierAccountTypes.ICustomInfo> }> = {
  control: Control<T>;
  errors: FieldErrors<T>;
};

const CustomInfoSection = <T extends { customInfo?: Partial<CarrierAccountTypes.ICustomInfo> }>({ control, errors }: CustomInfoSectionProps<T>) => {
  const mode = useTheme().palette.mode;

  const borderDashed = mode === 'light' ? '1px dashed rgba(0,0,0,0.12)' : '1px dashed rgba(255,255,255,0.2)';
  const customInfoErrors = errors.customInfo as FieldErrors<CarrierAccountTypes.ICustomInfo> | undefined;
  const addressErrors = customInfoErrors?.address;

  return (
    <Grid size={{ xs: 12 }}>
      <Box sx={{ p: 2, border: borderDashed, borderRadius: 1 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name={'customInfo.fullName' as Path<T>}
              control={control}
              rules={{
                validate: value => {
                  if (!value) return true;
                  if (typeof value !== 'string') return true;
                  if (value.length < 2) return FULLNAME.MIN;
                  if (value.length > 75) return FULLNAME.MAX;
                  return true;
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value ?? ''}
                  label="Ad-Soyad"
                  fullWidth
                  error={!!customInfoErrors?.fullName}
                  helperText={customInfoErrors?.fullName?.message as string}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name={'customInfo.email' as Path<T>}
              control={control}
              rules={{
                validate: value => {
                  if (!value) return true;
                  return /^\S+@\S+$/i.test(value as string) || EMAIL.INVALID;
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value ?? ''}
                  label="E-Posta"
                  fullWidth
                  error={!!customInfoErrors?.email}
                  helperText={customInfoErrors?.email?.message as string}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name={'customInfo.company' as Path<T>}
              rules={{
                validate: value => {
                  if (!value) return true;
                  if (typeof value !== 'string') return true;
                  if (value.length < 2) return COMPANY.MIN;
                  if (value.length > 75) return COMPANY.MAX;
                  return true;
                },
              }}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value ?? ''}
                  label="Firma İsmi"
                  fullWidth
                  error={!!customInfoErrors?.company}
                  helperText={customInfoErrors?.company?.message as string}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name={'customInfo.phone' as Path<T>}
              control={control}
              rules={{
                validate: value => {
                  if (!value) return true;
                  if (typeof value !== 'string') return PHONE.LENGTH;
                  return value.length === 10 || PHONE.LENGTH;
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value ?? ''}
                  label="Telefon No"
                  fullWidth
                  placeholder="5333022159"
                  error={!!customInfoErrors?.phone}
                  helperText={customInfoErrors?.phone?.message as string}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name={'customInfo.address.line1' as Path<T>}
              control={control}
              rules={{
                validate: value => {
                  if (!value) return true;
                  if (typeof value !== 'string') return true;
                  if (value.length < 5) return LINE.MIN;
                  if (value.length > 255) return LINE.MAX;
                  return true;
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value ?? ''}
                  fullWidth
                  label="Adres"
                  error={!!addressErrors?.line1}
                  helperText={addressErrors?.line1?.message as string}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name={'customInfo.address.line2' as Path<T>}
              control={control}
              rules={{
                validate: value => {
                  if (!value) return true;
                  if (typeof value !== 'string') return true;
                  if (value.length > 255) return LINE.MAX;
                  return true;
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value ?? ''}
                  fullWidth
                  label="Adres 2"
                  error={!!addressErrors?.line2}
                  helperText={addressErrors?.line2?.message as string}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name={'customInfo.address.district' as Path<T>}
              control={control}
              rules={{
                validate: value => {
                  if (!value) return true;
                  if (typeof value !== 'string') return true;
                  if (value.length < 2) return DISTRICT.MIN;
                  if (value.length > 25) return DISTRICT.MAX;
                  return true;
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value ?? ''}
                  fullWidth
                  label="İlçe"
                  error={!!addressErrors?.district}
                  helperText={addressErrors?.district?.message as string}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name={'customInfo.address.city' as Path<T>}
              control={control}
              rules={{
                validate: value => {
                  if (!value) return true;
                  if (typeof value !== 'string') return true;
                  if (value.length < 2) return CITY.MIN;
                  if (value.length > 35) return CITY.MAX;
                  return true;
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value ?? ''}
                  fullWidth
                  label="Şehir"
                  error={!!addressErrors?.city}
                  helperText={addressErrors?.city?.message as string}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name={'customInfo.address.postalCode' as Path<T>}
              control={control}
              rules={{
                validate: value => {
                  if (!value) return true;
                  if (typeof value !== 'string') return POSTALCODE.LENGTH;
                  return value.length === 5 || POSTALCODE.LENGTH;
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value ?? ''}
                  fullWidth
                  label="Posta Kodu"
                  error={!!addressErrors?.postalCode}
                  helperText={addressErrors?.postalCode?.message as string}
                />
              )}
            />
          </Grid>
        </Grid>
      </Box>
    </Grid>
  );
};

export default CustomInfoSection;
