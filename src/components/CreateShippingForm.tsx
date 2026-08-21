'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Checkbox, FormControlLabel, useTheme } from '@mui/material';
import cleanDeep from 'clean-deep';
import { FormProvider, useForm } from 'react-hook-form';

import createShipping from '@/app/actions/shipping/createShipping';
import getUser from '@/app/actions/user/getUser';
import { TableHeader } from '@/components';
import ShippingFormFields from '@/components/ShippingFormFields';
import StyledButton from '@/components/StyledButton';
import { CurrencyEnum, generalMessages, shippingMessages, ShippingPayor, ShippingPurpose, userMessages } from '@/constants';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { ShippingTypes } from '@/types/shipping';
import { UserTypes } from '@/types/user';

const { CREATESHIPPING } = shippingMessages;
const { UNEXPECTED_ERROR } = generalMessages;
const { NOT_FOUND } = userMessages;

const CreateShippingForm = () => {
  const theme = useTheme();
  const router = useRouter();

  const [pending, startTransition] = useTransition();
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [user, setUser] = useState<UserTypes.UserDto | null>(null);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchUser = async () => {
      const result = await getUser();
      if (result.status === 'OK' && result.data) {
        setUser(result.data);
      } else {
        showSnackbar(result.message || NOT_FOUND, 'error');
      }
    };
    fetchUser();
  }, []);

  const methods = useForm<ShippingTypes.ICreateShippingFormPayload>({
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
          showSnackbar(message || CREATESHIPPING.ERROR, 'error');
          return;
        }

        if (!data?._id) {
          showSnackbar(message || CREATESHIPPING.ERROR, 'error');
          return;
        }

        if (isBatchMode) {
          methods.reset(undefined, { keepDefaultValues: true });

          showSnackbar(message || CREATESHIPPING.SUCCESS, 'success');

          return;
        }

        router.replace(`/panel/gonderilerim/${data._id}`);
      } catch {
        showSnackbar(UNEXPECTED_ERROR, 'error');
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
    </Box>
  );
};

export default CreateShippingForm;
