'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useParams } from 'next/navigation';

import { Alert, Box, CircularProgress, Snackbar, Typography, useTheme } from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';

import getShipping from '@/app/actions/shipping/getShipping';
import updateShipping from '@/app/actions/shipping/updateShipping';
import StyledButton from '@/components/StyledButton';
import { generalMessages, shippingMessages } from '@/constants';
import ShippingFormFields from '@/components/ShippingFormFields';
import { ShippingTypes } from '@/types/shipping';

const { UPDATESHIPPING } = shippingMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const EditShippingForm = () => {
  const theme = useTheme();
  const { id: shippingId } = useParams<{ id: string }>();

  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const methods = useForm<ShippingTypes.IUpdateShippingPayload>({});

  useEffect(() => {
    let mounted = true;

    const fetchAndReset = async () => {
      if (!shippingId) {
        return;
      }

      setLoading(true);
      try {
        const res = await getShipping(shippingId);

        if (!mounted) return;

        if (res.status === 'OK' && res.data) {
          methods.reset({
            shippingId: res.data._id,
            consignee: res.data.consignee,
            detail: res.data.detail,
            content: res.data.content,
            package: res.data.package,
          });
        } else {
          setSnackbar({
            open: true,
            severity: 'error',
            message: 'Veri yüklenemedi',
          });
        }
      } catch {
        if (!mounted) return;

        setSnackbar({
          open: true,
          severity: 'error',
          message: UNEXPECTED_ERROR,
        });
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchAndReset();

    return () => {
      mounted = false;
    };
  }, [shippingId, methods]);

  const onSubmit = (values: ShippingTypes.IUpdateShippingPayload) => {
    if (!shippingId) return;

    startTransition(async () => {
      const response = await updateShipping({
        ...values,
        shippingId,
      });

      if (response.status === 'ERROR') {
        setSnackbar({
          open: true,
          severity: 'error',
          message: response.message ?? UNEXPECTED_ERROR,
        });
        return;
      }

      setSnackbar({
        open: true,
        message: response.message ?? UPDATESHIPPING.SUCCESS,
        severity: 'success',
      });
    });
  };

  if (loading) {
    return (
      <Box sx={{ padding: 5, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          width: '100%',
          backgroundColor: theme.palette.dashboard.sidebar,
          color: theme.palette.dashboard.textSidebar,
          p: '24px',
          borderRadius: '12px',
        }}
      >
        <Typography variant="h5" sx={{ mb: 3 }}>
          Gönderiyi Güncelle
        </Typography>

        <FormProvider {...methods}>
          <Box
            component="form"
            noValidate
            sx={{
              pointerEvents: pending ? 'none' : 'auto',
              opacity: pending ? 0.6 : 1,
            }}
          >
            <ShippingFormFields />

            <StyledButton type="button" onClick={methods.handleSubmit(onSubmit)} fullWidth disabled={pending} sx={{ marginTop: '24px' }}>
              {pending ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
            </StyledButton>
          </Box>
        </FormProvider>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() =>
          setSnackbar(prev => ({
            ...prev,
            open: false,
          }))
        }
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EditShippingForm;
