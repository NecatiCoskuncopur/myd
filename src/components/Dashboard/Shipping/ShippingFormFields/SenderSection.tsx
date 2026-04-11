'use client';

import React, { useEffect, useState } from 'react';

import { Autocomplete, CircularProgress, Grid, TextField, Typography } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

import searchSenderUser from '@/app/actions/admin/searchSenderUser';
import Wrapper from './Wrapper';

const SenderSection = () => {
  const { control } = useFormContext<ShippingTypes.ICreateShippingPayload>();

  const [options, setOptions] = useState<AdminTypes.ISearchSenderResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminTypes.ISearchSenderResult | null>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (inputValue.length < 2) {
        setOptions([]);
        return;
      }

      setLoading(true);
      try {
        const res = await searchSenderUser({
          firstName: inputValue,
          lastName: inputValue,
          company: inputValue,
        });

        if (res.status === 'OK') {
          setOptions(res.data || []);
        }
      } catch (error) {
        console.error('Search Error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [inputValue]);

  return (
    <Wrapper title="Gönderici Bilgileri">
      <Grid size={{ xs: 12 }}>
        <Controller
          name="senderId"
          control={control}
          render={({ field }) => (
            <Autocomplete
              options={options}
              loading={loading}
              value={selectedUser}
              onInputChange={(_, value) => setInputValue(value)}
              onChange={(_, result: AdminTypes.ISearchSenderResult | null) => {
                setSelectedUser(result);
                field.onChange(result?._id || '');
              }}
              getOptionLabel={option => `${option.firstName ?? ''} ${option.lastName ?? ''} ${option.company ? `(${option.company})` : ''}`}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              renderOption={(props, option) => (
                <li {...props} key={option._id}>
                  <Grid container>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="body1">
                        {option.firstName} {option.lastName}
                      </Typography>
                      {option.company && (
                        <Typography variant="caption" color="text.secondary">
                          {option.company}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </li>
              )}
              filterOptions={x => x}
              noOptionsText={inputValue.length < 2 ? 'Aramak için en az 2 harf girin' : 'Kullanıcı bulunamadı'}
              renderInput={params => (
                <TextField
                  {...params}
                  label="Gönderici Ara"
                  placeholder="Ad, Soyad veya Şirket..."
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          )}
        />
      </Grid>
    </Wrapper>
  );
};

export default SenderSection;
