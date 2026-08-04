import { Box, Grid, TextField } from '@mui/material';
import { Control, Controller, FieldErrors, Path } from 'react-hook-form';
import { addressMessages, userMessages } from '@/constants';
import { CarrierAccountTypes } from '@/types/carrierAccount';

const { CITY, DISTRICT, LINE, POSTALCODE } = addressMessages;
const { COMPANY, EMAIL, FIRSTNAME, LASTNAME, PHONE } = userMessages;

type CustomInfoSectionProps<T extends { customInfo?: Partial<CarrierAccountTypes.ICustomInfo> }> = {
  control: Control<T>;
  errors: FieldErrors<T>;
};

const CustomInfoSection = <T extends { customInfo?: Partial<CarrierAccountTypes.ICustomInfo> }>({ control, errors }: CustomInfoSectionProps<T>) => {
  const customInfoErrors = errors.customInfo as FieldErrors<CarrierAccountTypes.ICustomInfo> | undefined;
  const addressErrors = customInfoErrors?.address;

  return (
    <Grid size={{ xs: 12 }}>
      <Box sx={{ p: 2, border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 1 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name={'customInfo.firstName' as Path<T>}
              control={control}
              rules={{
                required: FIRSTNAME.REQUIRED,
                minLength: { value: 2, message: FIRSTNAME.MIN },
                maxLength: { value: 75, message: FIRSTNAME.MAX },
              }}
              render={({ field }) => (
                <TextField {...field} label="Ad" fullWidth error={!!customInfoErrors?.firstName} helperText={customInfoErrors?.firstName?.message as string} />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name={'customInfo.lastName' as Path<T>}
              control={control}
              rules={{
                required: LASTNAME.REQUIRED,
                minLength: { value: 2, message: LASTNAME.MIN },
                maxLength: { value: 75, message: LASTNAME.MAX },
              }}
              render={({ field }) => (
                <TextField {...field} label="Soyad" fullWidth error={!!customInfoErrors?.lastName} helperText={customInfoErrors?.lastName?.message as string} />
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
                required: PHONE.REQUIRED,
                validate: value => {
                  if (typeof value !== 'string') return PHONE.LENGTH;

                  return value.length === 10 || PHONE.LENGTH;
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
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
              name={'customInfo.email' as Path<T>}
              control={control}
              rules={{
                required: EMAIL.REQUIRED,
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: EMAIL.INVALID,
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="E-Posta"
                  fullWidth
                  error={!!customInfoErrors?.email}
                  helperText={customInfoErrors?.email?.message as string}
                  onChange={e => {
                    field.onChange(e);
                  }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name={'customInfo.address.line1' as Path<T>}
              control={control}
              rules={{
                required: LINE.REQUIRED,
                minLength: { value: 5, message: LINE.MIN },
                maxLength: { value: 255, message: LINE.MAX },
              }}
              render={({ field }) => (
                <TextField {...field} fullWidth label="Adres" error={!!addressErrors?.line1} helperText={addressErrors?.line1?.message as string} />
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
                <TextField {...field} fullWidth label="Adres 2" error={!!addressErrors?.line2} helperText={addressErrors?.line2?.message as string} />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name={'customInfo.address.district' as Path<T>}
              control={control}
              rules={{
                required: DISTRICT.REQUIRED,
                minLength: { value: 2, message: DISTRICT.MIN },
                maxLength: { value: 25, message: DISTRICT.MAX },
              }}
              render={({ field }) => (
                <TextField {...field} fullWidth label="İlçe" error={!!addressErrors?.district} helperText={addressErrors?.district?.message as string} />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name={'customInfo.address.city' as Path<T>}
              control={control}
              rules={{
                required: CITY.REQUIRED,
                minLength: { value: 2, message: CITY.MIN },
                maxLength: { value: 35, message: CITY.MAX },
              }}
              render={({ field }) => (
                <TextField {...field} fullWidth label="Şehir" error={!!addressErrors?.city} helperText={addressErrors?.city?.message as string} />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name={'customInfo.address.postalCode' as Path<T>}
              control={control}
              rules={{
                required: POSTALCODE.REQUIRED,
                validate: value => {
                  if (typeof value !== 'string') return POSTALCODE.LENGTH;

                  return value.length === 5 || POSTALCODE.LENGTH;
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
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
