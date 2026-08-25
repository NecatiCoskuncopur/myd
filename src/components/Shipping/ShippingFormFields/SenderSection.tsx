'use client';

import { useEffect, useRef, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { Autocomplete, Button, CircularProgress, Drawer, Grid, TextField, Typography } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

import searchSenderUser from '@/app/actions/admin/searchSenderUser';
import CreateUserForm from '@/components/CreateUserForm';
import { generalMessages } from '@/constants';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { AdminTypes } from '@/types/admin';
import { ShippingTypes } from '@/types/shipping';

import Wrapper from './Wrapper';

const SenderSection = () => {
  const { control, setValue } = useFormContext<ShippingTypes.ICreateShippingFormPayload>();

  const { showSnackbar } = useSnackbar();

  const [options, setOptions] = useState<AdminTypes.ISearchSenderResult[]>([]);

  const [loading, setLoading] = useState(false);

  const [inputValue, setInputValue] = useState('');

  const [selectedUser, setSelectedUser] = useState<AdminTypes.ISearchSenderResult | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const searchRequestIdRef = useRef(0);

  useEffect(() => {
    const value = inputValue.trim();

    const requestId = ++searchRequestIdRef.current;

    if (value.length < 2) {
      setOptions([]);
      setLoading(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);

      try {
        const response = await searchSenderUser({
          firstName: value,
          lastName: value,
          company: value,
        });

        if (requestId !== searchRequestIdRef.current) {
          return;
        }

        if (response.status === 'OK') {
          const results = Array.isArray(response.data) ? (response.data as AdminTypes.ISearchSenderResult[]) : [];

          setOptions(results);

          return;
        }

        setOptions([]);

        showSnackbar(response.message ?? generalMessages.UNEXPECTED_ERROR, 'error');
      } catch {
        if (requestId !== searchRequestIdRef.current) {
          return;
        }

        setOptions([]);

        showSnackbar(generalMessages.UNEXPECTED_ERROR, 'error');
      } finally {
        if (requestId === searchRequestIdRef.current) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, [inputValue, showSnackbar]);

  const handleUserCreated = (newUser: AdminTypes.ISearchSenderResult) => {
    setOptions(prev => [newUser, ...prev]);

    setSelectedUser(newUser);

    setValue('senderId', newUser._id.toString());

    setIsDrawerOpen(false);

    showSnackbar('Kullanıcı başarıyla oluşturuldu ve seçildi.', 'success');
  };

  return (
    <Wrapper title="Gönderici Bilgileri">
      <Grid container spacing={2} sx={{ width: '100%' }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="senderId"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={options}
                loading={loading}
                value={selectedUser}
                onInputChange={(_, value, reason) => {
                  if (reason === 'input') {
                    setInputValue(value);
                  }

                  if (reason === 'clear') {
                    setInputValue('');
                  }
                }}
                onChange={(_, result: AdminTypes.ISearchSenderResult | null) => {
                  setSelectedUser(result);

                  field.onChange(result?._id ?? '');

                  if (!result) {
                    setInputValue('');
                    setOptions([]);
                  }
                }}
                getOptionLabel={option => `${option.firstName ?? ''} ${option.lastName ?? ''} ${option.company ? `(${option.company})` : ''}`.trim()}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                renderOption={(props, option) => {
                  const { key, ...optionProps } = props;

                  return (
                    <li key={option._id.toString()} {...optionProps}>
                      <Grid container>
                        <Grid
                          size={{
                            xs: 12,
                          }}
                        >
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
                  );
                }}
                filterOptions={options => options}
                noOptionsText={inputValue.trim().length < 2 ? 'Aramak için en az 2 harf girin' : 'Kullanıcı bulunamadı'}
                renderInput={params => {
                  const { slotProps, ...restParams } = params;

                  return (
                    <TextField
                      {...restParams}
                      label="Gönderici Ara"
                      placeholder="Ad, Soyad veya Şirket..."
                      slotProps={{
                        ...slotProps,
                        input: {
                          ...slotProps?.input,
                          endAdornment: (
                            <>
                              {loading && <CircularProgress color="inherit" size={20} />}

                              {slotProps?.input?.endAdornment}
                            </>
                          ),
                        },
                      }}
                    />
                  );
                }}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Button
            type="button"
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setIsDrawerOpen(true)}
            sx={{
              height: 40,
              width: '100%',
            }}
          >
            Yeni Kullanıcı Oluştur
          </Button>
        </Grid>
      </Grid>

      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        slotProps={{
          paper: {
            sx: theme => ({
              width: {
                xs: '100%',
                sm: 550,
              },
              p: 4,
              backgroundImage: 'none',
              backgroundColor: theme.palette.dashboard.sidebar,
            }),
          },
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mb: 3,
            fontWeight: 'bold',
          }}
        >
          Yeni Gönderici Kaydı
        </Typography>

        <CreateUserForm onSuccess={handleUserCreated} />
      </Drawer>
    </Wrapper>
  );
};

export default SenderSection;
