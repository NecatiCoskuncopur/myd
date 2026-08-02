'use client';

import React, { useEffect, useState } from 'react';
import { Autocomplete, Grid, TextField, Typography } from '@mui/material';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { addressMessages, countries, countryStates, shippingMessages, userMessages } from '@/constants';
import ErrorTooltip from './ErrorToolTip';
import Wrapper from './Wrapper';
import { ShippingTypes } from '@/types/shipping';
import { ConsigneeTypes } from '@/types/consignee';
import getConsignees from '@/app/actions/consignee/getConsignees';

const { CITY, COUNTRY, LINE, POSTALCODE, STATE } = addressMessages;
const { COMPANY, EMAIL, PHONE } = userMessages;
const { CONSIGNEE } = shippingMessages;

const ConsigneeSection = () => {
  const [options, setOptions] = useState<ConsigneeTypes.IConsigneeResponse[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedConsignee, setSelectedConsignee] = useState<ConsigneeTypes.IConsigneeResponse | null>(null);
  const [open, setOpen] = useState(false);
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<ShippingTypes.ICreateShippingPayload | ShippingTypes.IUpdateShippingPayload>();

  const selectedCountry = useWatch({
    control,
    name: 'consignee.address.country',
  }) as keyof typeof countryStates | undefined;

  const states = selectedCountry ? countryStates[selectedCountry] : null;
  const hasStates = states && states.length > 0;

  useEffect(() => {
    if (selectedConsignee) return;

    const timeout = setTimeout(async () => {
      const value = inputValue.trim();

      if (value.length < 2) {
        setOptions([]);
        setOpen(false);
        return;
      }

      const response = await getConsignees({
        name: value,
        page: 1,
        limit: 10,
      });

      if (response.status === 'OK') {
        const result = response.data?.consignees ?? [];

        setOptions(result);

        if (result.length > 0) {
          setOpen(true);
        } else {
          setOpen(false);
        }
      } else {
        setOptions([]);
        setOpen(false);
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [inputValue]);

  const clearConsignee = () => {
    setSelectedConsignee(null);

    const fields = [
      'consignee.name',
      'consignee.company',
      'consignee.phone',
      'consignee.email',
      'consignee.taxId',
      'consignee.address.line1',
      'consignee.address.line2',
      'consignee.address.country',
      'consignee.address.state',
      'consignee.address.city',
      'consignee.address.postalCode',
    ] as const;

    fields.forEach(field => {
      setValue(field, '');
    });

    setInputValue('');
    setOptions([]);
  };

  return (
    <Wrapper
      title="Alıcı Bilgileri"
      headerAction={
        selectedConsignee && (
          <Typography
            variant="body2"
            sx={{
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 500,
            }}
            onClick={clearConsignee}
          >
            Seçilen Alıcıyı Kaldır
          </Typography>
        )
      }
    >
      <Grid size={{ xs: 12, md: 5 }}>
        <Controller
          name="consignee.name"
          control={control}
          rules={{
            required: CONSIGNEE.NAME.REQUIRED,
            minLength: { value: 4, message: CONSIGNEE.NAME.MIN },
            maxLength: { value: 35, message: CONSIGNEE.NAME.MAX },
          }}
          render={({ field }) => {
            const errorMessage = errors.consignee?.name?.message;

            return (
              <ErrorTooltip message={errorMessage}>
                <Autocomplete
                  options={options}
                  loading={false}
                  open={open}
                  onClose={() => setOpen(false)}
                  inputValue={inputValue}
                  value={options.find(option => option.name === field.value) ?? null}
                  getOptionLabel={option => (typeof option === 'string' ? option : option.name)}
                  onInputChange={(_, value) => {
                    setInputValue(value);
                    field.onChange(value);
                  }}
                  onChange={(_, value) => {
                    if (!value) {
                      field.onChange('');
                      setSelectedConsignee(null);
                      return;
                    }

                    setSelectedConsignee(value);
                    field.onChange(value.name);

                    setValue('consignee.company', value.company ?? '');

                    setValue('consignee.phone', value.phone ?? '');

                    setValue('consignee.email', value.email ?? '');

                    setValue('consignee.taxId', value.taxId ?? '');

                    setValue('consignee.address.line1', value.address?.line1 ?? '');

                    setValue('consignee.address.line2', value.address?.line2 ?? '');

                    setValue('consignee.address.city', value.address?.city ?? '');

                    setValue('consignee.address.postalCode', value.address?.postalCode ?? '');

                    setValue('consignee.address.country', value.address?.country ?? '');

                    setValue('consignee.address.state', value.address?.state ?? '');
                  }}
                  isOptionEqualToValue={(option, value) => option._id === value?._id}
                  disabled={!!selectedConsignee}
                  renderOption={(props, option) => (
                    <li {...props} key={option._id}>
                      <div>
                        <strong>{option.name}</strong>
                        {option.company && <div>{option.company}</div>}
                      </div>
                    </li>
                  )}
                  renderInput={params => <TextField {...params} label="Ad *" fullWidth error={!!errorMessage} disabled={!!selectedConsignee} />}
                />
              </ErrorTooltip>
            );
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 7 }}>
        <Controller
          name="consignee.address.line1"
          rules={{
            required: LINE.REQUIRED,
            minLength: { value: 5, message: LINE.MIN },
            maxLength: { value: 255, message: LINE.MAX },
          }}
          control={control}
          render={({ field }) => {
            const errorMessage = errors.consignee?.address?.line1?.message;

            return (
              <ErrorTooltip message={errorMessage}>
                <TextField {...field} label="Adres *" fullWidth error={!!errorMessage} disabled={!!selectedConsignee} />
              </ErrorTooltip>
            );
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
        <Controller
          name="consignee.company"
          rules={{
            validate: value => {
              if (!value) return true;
              if (value.length < 2) return COMPANY.MIN;
              if (value.length > 75) return COMPANY.MAX;
              return true;
            },
          }}
          control={control}
          render={({ field }) => {
            const errorMessage = errors.consignee?.company?.message;

            return (
              <ErrorTooltip message={errorMessage}>
                <TextField {...field} label="Şirket" fullWidth error={!!errorMessage} disabled={!!selectedConsignee} />
              </ErrorTooltip>
            );
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
        <Controller
          name="consignee.address.line2"
          rules={{
            validate: value => {
              if (!value) return true;
              if (value.length < 5) return LINE.MIN;
              if (value.length > 255) return LINE.MAX;
              return true;
            },
          }}
          control={control}
          render={({ field }) => {
            const errorMessage = errors.consignee?.address?.line2?.message;

            return (
              <ErrorTooltip message={errorMessage}>
                <TextField {...field} label="Adres 2" fullWidth error={!!errorMessage} disabled={!!selectedConsignee} />
              </ErrorTooltip>
            );
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 5 }}>
        <Controller
          name="consignee.phone"
          rules={{
            validate: value => {
              if (!value) return true;
              if (value.length !== 10) return PHONE.LENGTH;
              return true;
            },
          }}
          control={control}
          render={({ field }) => {
            const errorMessage = errors.consignee?.phone?.message;

            return (
              <ErrorTooltip message={errorMessage}>
                <TextField {...field} label="Telefon" fullWidth error={!!errorMessage} disabled={!!selectedConsignee} />
              </ErrorTooltip>
            );
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: states ? 3.5 : 7 }}>
        <Controller
          name="consignee.address.country"
          control={control}
          rules={{
            required: COUNTRY.REQUIRED,
            minLength: { value: 2, message: COUNTRY.MIN },
            maxLength: { value: 45, message: COUNTRY.MAX },
          }}
          render={({ field }) => {
            const errorMessage = errors.consignee?.address?.country?.message;

            return (
              <ErrorTooltip message={errorMessage}>
                <Autocomplete
                  options={countries}
                  getOptionLabel={option => (option.turkishName ? `${option.name} (${option.turkishName})` : option.name)}
                  value={countries.find(c => c.code === field.value) || null}
                  onChange={(_, value) => {
                    const newCountryCode = value ? value.code : '';
                    field.onChange(newCountryCode);
                    setValue('consignee.address.state', '');
                  }}
                  isOptionEqualToValue={(option, value) => option.code === value.code}
                  renderInput={params => <TextField {...params} label="Ülke *" fullWidth error={!!errorMessage} />}
                  disabled={!!selectedConsignee}
                />
              </ErrorTooltip>
            );
          }}
        />
      </Grid>
      {hasStates && (
        <Grid size={{ xs: 12, md: 3.5 }}>
          <Controller
            name="consignee.address.state"
            control={control}
            rules={{
              validate: value => {
                if (!value) return true;
                if (value.length < 2) return STATE.MIN;
                if (value.length > 45) return STATE.MAX;
                return true;
              },
            }}
            render={({ field }) => {
              const errorMessage = errors.consignee?.address?.state?.message;

              return (
                <ErrorTooltip message={errorMessage}>
                  <Autocomplete
                    options={states}
                    getOptionLabel={option => option.name}
                    value={states.find(s => s.code === field.value) || null}
                    onChange={(_, value) => {
                      field.onChange(value ? value.code : '');
                    }}
                    isOptionEqualToValue={(option, value) => option.code === value.code}
                    renderInput={params => <TextField {...params} label="Eyalet *" fullWidth />}
                    disabled={!!selectedConsignee}
                  />
                </ErrorTooltip>
              );
            }}
          />
        </Grid>
      )}

      <Grid size={{ xs: 12, md: 2.5 }}>
        <Controller
          name="consignee.email"
          control={control}
          rules={{
            validate: value => {
              if (!value) return true;
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(value)) {
                return EMAIL.INVALID;
              }

              return true;
            },
          }}
          render={({ field }) => {
            const errorMessage = errors.consignee?.email?.message;
            return (
              <ErrorTooltip message={errorMessage}>
                <TextField {...field} label="E-Posta" fullWidth error={!!errorMessage} disabled={!!selectedConsignee} />
              </ErrorTooltip>
            );
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 2.5 }}>
        <Controller
          name="consignee.taxId"
          control={control}
          rules={{
            validate: value => {
              if (!value) return true;
              if (value.length > 35) return CONSIGNEE.TAXID.MAX;
              return true;
            },
          }}
          render={({ field }) => {
            const errorMessage = errors.consignee?.taxId?.message;
            return (
              <ErrorTooltip message={errorMessage}>
                <TextField {...field} label="Vergi No" fullWidth error={!!errorMessage} disabled={!!selectedConsignee} />
              </ErrorTooltip>
            );
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 3.5 }}>
        <Controller
          name="consignee.address.city"
          control={control}
          rules={{
            required: CITY.REQUIRED,
            minLength: { value: 2, message: CITY.MIN },
            maxLength: { value: 35, message: CITY.MAX },
          }}
          render={({ field }) => {
            const errorMessage = errors.consignee?.address?.city?.message;
            return (
              <ErrorTooltip message={errorMessage}>
                <TextField {...field} label="Şehir *" fullWidth error={!!errorMessage} disabled={!!selectedConsignee} />
              </ErrorTooltip>
            );
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 3.5 }}>
        <Controller
          name="consignee.address.postalCode"
          control={control}
          rules={{
            required: POSTALCODE.REQUIRED,
            validate: value => value.length === 5 || POSTALCODE.LENGTH,
          }}
          render={({ field }) => {
            const errorMessage = errors.consignee?.address?.postalCode?.message;
            return (
              <ErrorTooltip message={errorMessage}>
                <TextField {...field} label="Posta Kodu *" fullWidth error={!!errorMessage} disabled={!!selectedConsignee} />
              </ErrorTooltip>
            );
          }}
        />
      </Grid>
    </Wrapper>
  );
};

export default ConsigneeSection;
