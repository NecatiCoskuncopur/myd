'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { Alert, Box, Checkbox, FormControlLabel, Snackbar, useTheme } from '@mui/material';
import cleanDeep from 'clean-deep';
import { FormProvider, useForm } from 'react-hook-form';

import createShipping from '@/app/actions/shipping/createShipping';
import getUser from '@/app/actions/user/getUser';
import StyledButton from '@/components/StyledButton';
import { CurrencyEnum, generalMessages, shippingMessages, ShippingPayor, ShippingPurpose, userMessages } from '@/constants';
import ShippingFormFields from '@/components/ShippingFormFields';
import { UserTypes } from '@/types/user';
import { TableHeader } from '@/components';
import { ShippingTypes } from '@/types/shipping';

const { CREATESHIPPING } = shippingMessages;
const { UNEXPECTED_ERROR } = generalMessages;
const { NOT_FOUND } = userMessages;

const CreateShippingForm = () => {
  const theme = useTheme();
  const router = useRouter();

  const [pending, startTransition] = useTransition();
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [user, setUser] = useState<UserTypes.UserDto | null>(null);
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

  const methods = useForm<ShippingTypes.ICreateShippingFormPayload>({
    defaultValues: {
      senderId: '',
      consignee: {
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
          shipping: ShippingPayor.SENDER,
          customs: ShippingPayor.SENDER,
        },
        iossNumber: '',
        purpose: ShippingPurpose.GIFT,
      },
      content: {
        currency: CurrencyEnum.USD,
        description: '',
        freight: '' as unknown as number,
        insurance: '' as unknown as number,
        products: [
          {
            name: '',
            piece: '' as unknown as number,
            unitPrice: '' as unknown as number,
            gtip: '',
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
    startTransition(async () => {
      const cleaned = cleanDeep(values) as ShippingTypes.ICreateShippingPayload;

      try {
        const { status, message, data } = await createShipping(cleaned);

        if (status === 'ERROR') {
          setSnackbar({
            open: true,
            message: message || CREATESHIPPING.ERROR,
            severity: 'error',
          });
          return;
        }

        if (!data?._id) {
          setSnackbar({
            open: true,
            message: message || CREATESHIPPING.ERROR,
            severity: 'error',
          });
          return;
        }

        if (isBatchMode) {
          methods.reset(undefined, { keepDefaultValues: true });

          setSnackbar({
            open: true,
            message: message || CREATESHIPPING.SUCCESS,
            severity: 'success',
          });

          return;
        }

        router.replace(`/panel/gonderilerim/${data._id}`);
      } catch {
        setSnackbar({
          open: true,
          message: UNEXPECTED_ERROR,
          severity: 'error',
        });
      }
    });
  };

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: 'calc(100vh - 48px)',
        backgroundColor: theme.palette.dashboard.sidebar,
        color: theme.palette.dashboard.textSidebar,
        p: '12px',
        borderRadius: '12px',
      }}
    >
      <TableHeader title="Gönderi Oluştur" subTitle="Alıcı, paket ve gönderi detaylarını girerek yeni bir sevkiyat oluşturun.">
        <FormControlLabel control={<Checkbox checked={isBatchMode} onChange={e => setIsBatchMode(e.target.checked)} />} label="Seri giriş" />
      </TableHeader>
      <FormProvider {...methods}>
        <Box
          component="form"
          sx={{
            pointerEvents: pending ? 'none' : 'auto',
            opacity: pending ? 0.6 : 1,
          }}
        >
          <ShippingFormFields user={user} />

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              mt: 2,
            }}
          >
            <StyledButton
              type="button"
              onClick={methods.handleSubmit(onSubmit)}
              disabled={pending}
              sx={{
                minWidth: { xs: '100%', md: '220px' },
                px: 4,
                py: 1.2,
                fontSize: '15px',
                fontWeight: 600,
              }}
            >
              Gönderi Oluştur
            </StyledButton>
          </Box>
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
