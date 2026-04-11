'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { Alert, Box, Checkbox, FormControlLabel, Snackbar, Typography, useTheme } from '@mui/material';
import cleanDeep from 'clean-deep';
import { FormProvider, useForm } from 'react-hook-form';

import createShipping from '@/app/actions/shipping/createShipping';
import getUser from '@/app/actions/user/getUser';
import StyledButton from '@/components/StyledButton';
import { generalMessages, shippingMessages, userMessages } from '@/constants';
import ShippingFormFields from './ShippingFormFields';

const { CREATESHIPPING } = shippingMessages;
const { UNEXPECTED_ERROR } = generalMessages;
const { NOT_FOUND } = userMessages;

const CreateShippingForm = () => {
  const theme = useTheme();
  const router = useRouter();

  const [pending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [user, setUser] = useState<UserTypes.IUser | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const fetchUser = async () => {
      const result = await getUser();
      if (result.status === 'OK' && result.data) {
        setUser(result.data);
      } else {
        setSnackbar({
          open: true,
          message: result.message || NOT_FOUND,
          severity: 'error',
        });
      }
    };
    fetchUser();
  }, []);

  const methods = useForm<ShippingTypes.ICreateShippingPayload>({
    defaultValues: {
      senderId: '',
      consignee: {
        _id: '',
        name: '',
        company: '',
        phone: '',
        email: '',
        taxId: '',
        address: {
          line1: '',
          line2: '',
          city: '',
          country: '',
          state: '',
          postalCode: '',
        },
      },
      detail: {
        payor: {
          shipping: 'SENDER',
          customs: 'SENDER',
        },
        iossNumber: '',
        purpose: 'GIFT',
      },
      content: {
        currency: 'USD',
        description: '',
        freight: '' as unknown as number,
        products: [
          {
            name: '',
            piece: '' as unknown as number,
            unitPrice: '' as unknown as number,
            harmonizedCode: '',
          },
        ],
      },
      package: {
        weight: '' as unknown as number,
        numberOfPackage: '' as unknown as number,
        width: '' as unknown as number,
        height: '' as unknown as number,
        length: '' as unknown as number,
        volumetricWeight: '' as unknown as number,
      },
    },
  });

  const onSubmit = (values: ShippingTypes.ICreateShippingPayload) => {
    setErrorMessage(null);
    const cleaned = cleanDeep(values) as ShippingTypes.ICreateShippingPayload;
    startTransition(async () => {
      try {
        const response = await createShipping(cleaned);

        if (response.status !== 'OK') {
          setErrorMessage(response.message ?? CREATESHIPPING.ERROR);
          return;
        }

        const shippingId = response.data?._id;

        if (!shippingId) {
          setErrorMessage(UNEXPECTED_ERROR);
          return;
        }

        if (isBatchMode) {
          methods.reset(undefined, { keepDefaultValues: true });
          setSnackbar({
            open: true,
            message: response.message ?? CREATESHIPPING.SUCCESS,
            severity: 'success',
          });
          return;
        }

        router.replace(`/panel/gonderilerim/${shippingId}`);
      } catch (error) {
        console.error('Create shipping failed:', error);
        setErrorMessage(UNEXPECTED_ERROR);
      }
    });
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        backgroundColor: theme.palette.dashboard.sidebar,
        color: theme.palette.dashboard.textSidebar,
        p: '12px',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 1,
        }}
      >
        <Typography variant="h5">Gönderi Oluştur</Typography>

        <FormControlLabel control={<Checkbox checked={isBatchMode} onChange={e => setIsBatchMode(e.target.checked)} />} label="Seri giriş" />
      </Box>

      {errorMessage && (
        <Typography color="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Typography>
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
          <ShippingFormFields user={user} />
          <StyledButton type="submit" fullWidth sx={{ marginTop: '12px' }}>
            Gönderi Oluştur
          </StyledButton>
        </Box>
      </FormProvider>
      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateShippingForm;
