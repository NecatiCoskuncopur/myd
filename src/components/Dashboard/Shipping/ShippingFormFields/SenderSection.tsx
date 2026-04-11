'use client';

import React, { useEffect, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import { Alert, Autocomplete, Button, CircularProgress, Drawer, Grid, Snackbar, TextField, Typography, useTheme } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

import searchSenderUser from '@/app/actions/admin/searchSenderUser';
import Wrapper from './Wrapper';
import CreateUserForm from '../CreateUserForm';

const SenderSection = () => {
  const theme = useTheme();
  const { control, setValue } = useFormContext<ShippingTypes.ICreateShippingPayload>();

  const [options, setOptions] = useState<AdminTypes.ISearchSenderResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminTypes.ISearchSenderResult | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

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

  const handleUserCreated = (newUser: AdminTypes.ISearchSenderResult) => {
    setOptions(prev => [newUser, ...prev]);
    setSelectedUser(newUser);
    setValue('senderId', newUser._id);
    setIsDrawerOpen(false);
    setSnackbar({ open: true, message: 'Kullanıcı başarıyla oluşturuldu ve seçildi.' });
  };

  return (
    <Wrapper title="Gönderici Bilgileri">
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 12 }}>
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

        <Grid size={{ xs: 12 }}>
          <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => setIsDrawerOpen(true)} sx={{ fontWeight: 600, mt: 2 }}>
            Yeni Kullanıcı Oluştur
          </Button>
        </Grid>
      </Grid>

      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 450 },
            p: 4,
            backgroundImage: 'none',
            backgroundColor: theme.palette.dashboard.sidebar,
          },
        }}
      >
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
          Yeni Gönderici Kaydı
        </Typography>

        <CreateUserForm onSuccess={handleUserCreated} />
      </Drawer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Wrapper>
  );
};

export default SenderSection;
