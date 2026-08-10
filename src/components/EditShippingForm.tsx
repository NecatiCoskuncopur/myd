'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useParams } from 'next/navigation';

import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';

import getShipping from '@/app/actions/shipping/getShipping';
import updateShipping from '@/app/actions/shipping/updateShipping';
import StyledButton from '@/components/StyledButton';
import { generalMessages, shippingMessages } from '@/constants';
import ShippingFormFields from '@/components/ShippingFormFields';
import { ShippingTypes } from '@/types/shipping';
import { useSnackbar } from '@/providers/SnackbarProvider';

const { UPDATESHIPPING } = shippingMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const EditShippingForm = () => {
  const theme = useTheme();
  const { id: shippingId } = useParams<{ id: string }>();

  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const { showSnackbar } = useSnackbar();

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
          showSnackbar('Veri yüklenemedi', 'error');
        }
      } catch {
        if (!mounted) return;
        showSnackbar(UNEXPECTED_ERROR, 'error');
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
        showSnackbar(response.message ?? UNEXPECTED_ERROR, 'error');
        return;
      }
      showSnackbar(response.message ?? UPDATESHIPPING.SUCCESS, 'success');
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
    </>
  );
};

export default EditShippingForm;
