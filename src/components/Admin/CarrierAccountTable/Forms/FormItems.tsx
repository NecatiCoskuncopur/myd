import React from 'react';
import { Box, Checkbox, Divider, FormControlLabel, Grid, MenuItem, TextField, Typography, useTheme } from '@mui/material';
import { Control, Controller, FieldError, FieldErrors, FieldPath, UseFormSetValue } from 'react-hook-form';

import { Carrier, CarrierAccountTypeEnum, carrierMessages } from '@/constants';
import { CarrierAccountTypes } from '@/types/carrierAccount';

import CustomInfoSection from '../CustomInfoSection';
import PricingZoneEditor from './PricingZoneEditor';

type CarrierAccountFormPayload = CarrierAccountTypes.ICreateCarrierAccountPayload | CarrierAccountTypes.IUpdateCarrierAccountPayload;

type FormItemsProps<T extends CarrierAccountFormPayload> = {
  control: Control<T>;
  errors: FieldErrors<T>;
  setValue: UseFormSetValue<T>;

  credentials: CarrierAccountTypes.ICarrierCredential[] | undefined;

  hasCustomInfo: boolean | undefined;

  mode: 'create' | 'update';

  account?: CarrierAccountTypes.ICarrierAccount | null;
};

const { ACCOUNTNUMBER, NAME } = carrierMessages;

const FormItems = <T extends CarrierAccountFormPayload>({ control, errors, setValue, credentials, hasCustomInfo, mode, account }: FormItemsProps<T>) => {
  const theme = useTheme();

  const borderDashed = theme.palette.mode === 'light' ? '1px dashed rgba(0,0,0,0.12)' : '1px dashed rgba(255,255,255,0.2)';

  const fieldName = <K extends FieldPath<T>>(name: K) => name;

  const handleCustomInfoChange = (checked: boolean) => {
    if (checked && !account?.customInfo) {
      setValue(fieldName('customInfo' as FieldPath<T>), {
        email: '',
        firstName: '',
        lastName: '',
        company: '',
        phone: '',
        address: {
          line1: '',
          line2: '',
          city: '',
          district: '',
          postalCode: '',
        },
      } as never);
    }

    if (!checked) {
      setValue(fieldName('customInfo' as FieldPath<T>), undefined as never);
    }
  };

  const credentialErrors = errors.credentials as
    | Array<{
        key?: FieldError;
        value?: FieldError;
      }>
    | undefined;

  return (
    <Grid container spacing={2} sx={{ mt: 0.5 }}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name={fieldName('name' as FieldPath<T>)}
          control={control}
          rules={{
            required: NAME.REQUIRED,
          }}
          render={({ field }) => (
            <TextField
              {...field}
              value={field.value ?? ''}
              fullWidth
              label="Hesap Adı"
              error={!!errors.name}
              helperText={errors.name?.message as string | undefined}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name={fieldName('displayName' as FieldPath<T>)}
          control={control}
          rules={{
            required: NAME.REQUIRED,
            minLength: {
              value: 2,
              message: NAME.MIN,
            },
            maxLength: {
              value: 75,
              message: NAME.MAX,
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              value={field.value ?? ''}
              fullWidth
              label="Görünen Hesap Adı"
              error={!!errors.displayName}
              helperText={errors.displayName?.message as string | undefined}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name={fieldName('accountNumber' as FieldPath<T>)}
          control={control}
          rules={{
            required: ACCOUNTNUMBER.REQUIRED,
          }}
          render={({ field }) => (
            <TextField
              {...field}
              value={field.value ?? ''}
              fullWidth
              label="Hesap Numarası"
              error={!!errors.accountNumber}
              helperText={errors.accountNumber?.message as string | undefined}
            />
          )}
        />
      </Grid>

      {mode === 'update' && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name={fieldName('isActive' as FieldPath<T>)}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                fullWidth
                label="Hesap Durumu"
                value={field.value === false ? 'false' : 'true'}
                onChange={event => field.onChange(event.target.value === 'true')}
              >
                <MenuItem value="true">Aktif</MenuItem>

                <MenuItem value="false">Pasif</MenuItem>
              </TextField>
            )}
          />
        </Grid>
      )}

      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name={fieldName('carrier' as FieldPath<T>)}
          control={control}
          render={({ field }) => (
            <TextField {...field} value={field.value ?? ''} select fullWidth label="Kargo Firması">
              {Object.values(Carrier).map(carrier => (
                <MenuItem key={carrier} value={carrier}>
                  {carrier}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name={fieldName('accountType' as FieldPath<T>)}
          control={control}
          render={({ field }) => (
            <TextField {...field} value={field.value ?? ''} select fullWidth label="Hesap Tipi" error={!!errors.accountType}>
              {Object.values(CarrierAccountTypeEnum).map(accountType => (
                <MenuItem key={accountType} value={accountType}>
                  {accountType}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Controller
          name={fieldName('hasCustomInfo' as FieldPath<T>)}
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!field.value}
                  onChange={event => {
                    const checked = event.target.checked;

                    field.onChange(checked);

                    handleCustomInfoChange(checked);
                  }}
                />
              }
              label="Özel gönderici bilgileri kullan"
            />
          )}
        />
      </Grid>

      {hasCustomInfo && (
        <Grid size={{ xs: 12 }}>
          <CustomInfoSection control={control as never} errors={errors as never} />
        </Grid>
      )}

      <Grid size={{ xs: 12 }}>
        <Box
          sx={{
            p: 2,
            border: borderDashed,
            borderRadius: 1,
          }}
        >
          <Grid container spacing={2}>
            {credentials?.map((credential, index) => {
              const credentialError = credentialErrors?.[index]?.value;

              return (
                <Grid size={{ xs: 12, md: 6 }} key={credential.key}>
                  <Controller
                    name={`credentials.${index}.value` as FieldPath<T>}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        value={field.value ?? ''}
                        fullWidth
                        label={credential.key}
                        error={!!credentialError}
                        helperText={credentialError?.message}
                      />
                    )}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Divider sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Fiyatlandırma</Typography>
        </Divider>

        <Typography
          variant="body2"
          sx={{
            mb: 2,
            color: 'text.secondary',
          }}
        >
          Bu taşıyıcı hesabı için ağırlık bazlı maliyet kurallarını tanımlayın.
        </Typography>

        <Controller
          name={'pricing.zones' as FieldPath<T>}
          control={control}
          render={({ field }) => <PricingZoneEditor value={field.value as never} onChange={field.onChange} />}
        />
      </Grid>
    </Grid>
  );
};

export default FormItems;
