'use client';

import { useEffect, useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { Alert, Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';

import getShipping from '@/app/actions/shipping/getShipping';
import updateShipping from '@/app/actions/shipping/updateShipping';
import StyledButton from '@/components/StyledButton';
import { generalMessages, shippingMessages } from '@/constants';
import ShippingFormFields from './ShippingFormFields';

const { UPDATESHIPPING } = shippingMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const EditShippingForm = () => {
  const theme = useTheme();
  const router = useRouter();
  const { id: shippingId } = useParams<{ id: string }>();

  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const methods = useForm<ShippingTypes.IUpdateShippingPayload>({});

  useEffect(() => {
    const fetchAndReset = async () => {
      try {
        const res = await getShipping(shippingId);
        if (res.status === 'OK' && res.data) {
          methods.reset({
            shippingId: res.data._id,
            consignee: res.data.consignee,
            detail: res.data.detail,
            content: res.data.content,
            package: res.data.package,
          });
        } else {
          setErrorMessage(res.message || 'Veri yüklenemedi');
        }
      } catch {
        setErrorMessage(UNEXPECTED_ERROR);
      } finally {
        setLoading(false);
      }
    };
    fetchAndReset();
  }, [shippingId, methods]);

  const onSubmit = (values: ShippingTypes.IUpdateShippingPayload) => {
    setErrorMessage(null);
    values.shippingId = shippingId;

    startTransition(async () => {
      try {
        const response = await updateShipping(values);

        if (response.status !== 'OK') {
          setErrorMessage(response.message ?? UPDATESHIPPING.ERROR);
          return;
        }

        router.replace(`/panel/gonderilerim/${shippingId}`);
      } catch (error) {
        console.error('Update shipping failed:', error);
        setErrorMessage(UNEXPECTED_ERROR);
      }
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={5}>
        <CircularProgress />
      </Box>
    );
  }

  return (
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

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      <FormProvider {...methods}>
        <Box
          component="form"
          onSubmit={methods.handleSubmit(onSubmit)}
          noValidate
          sx={{
            pointerEvents: pending ? 'none' : 'auto',
            opacity: pending ? 0.6 : 1,
          }}
        >
          <ShippingFormFields />

          <StyledButton type="submit" fullWidth disabled={pending} sx={{ marginTop: '24px' }}>
            {pending ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
          </StyledButton>
        </Box>
      </FormProvider>
    </Box>
  );
};

export default EditShippingForm;
