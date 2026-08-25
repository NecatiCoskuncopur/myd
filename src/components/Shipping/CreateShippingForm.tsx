'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Checkbox, FormControlLabel } from '@mui/material';
import cleanDeep from 'clean-deep';
import { FormProvider, useForm } from 'react-hook-form';

import { StyledButton } from '@//components';
import { CurrencyEnum, generalMessages, shippingMessages, ShippingPayor, ShippingPurpose } from '@//constants';
import { useSnackbar } from '@//providers/SnackbarProvider';
import { ShippingTypes } from '@//types/shipping';
import { UserTypes } from '@//types/user';
import createShipping from '@/app/actions/shipping/createShipping';
import { TableHeader } from '@/components/index';

import ShippingFormFields from './ShippingFormFields';

const { CREATESHIPPING } = shippingMessages;
const { UNEXPECTED_ERROR } = generalMessages;

type CreateShippingFormProps = {
  user: UserTypes.UserDto | undefined;
};

const CreateShippingForm = ({ user }: CreateShippingFormProps) => {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const [isBatchMode, setIsBatchMode] = useState(false);

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
        freight: undefined,
        insurance: undefined,
        products: [
          {
            name: '',
            piece: undefined,
            unitPrice: undefined,
            gtip: '',
          },
        ],
      },
      package: {
        weight: undefined,
        numberOfPackage: undefined,
        width: undefined,
        height: undefined,
        length: undefined,
        volumetricWeight: 0,
      },
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (values: ShippingTypes.ICreateShippingFormPayload) => {
    const cleaned = cleanDeep(values) as ShippingTypes.ICreateShippingPayload;

    try {
      const response = await createShipping(cleaned);

      if (response.status !== 'OK' || !response.data?._id) {
        showSnackbar(response.message ?? CREATESHIPPING.ERROR, 'error');

        return;
      }

      if (isBatchMode) {
        reset();

        showSnackbar(response.message ?? CREATESHIPPING.SUCCESS, 'success');

        return;
      }

      router.replace(`/panel/gonderilerim/${response.data._id}`);
    } catch {
      showSnackbar(UNEXPECTED_ERROR, 'error');
    }
  };

  return (
    <Box
      sx={theme => ({
        width: '100%',
        minHeight: 'calc(100vh - 48px)',
        backgroundColor: theme.palette.dashboard.sidebar,
        color: theme.palette.dashboard.textSidebar,
        p: 1.5,
        borderRadius: '12px',
      })}
    >
      <TableHeader title="Gönderi Oluştur" subTitle="Alıcı, paket ve gönderi detaylarını girerek yeni bir sevkiyat oluşturun.">
        <FormControlLabel control={<Checkbox checked={isBatchMode} onChange={event => setIsBatchMode(event.target.checked)} />} label="Seri giriş" />
      </TableHeader>

      <FormProvider {...methods}>
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            pointerEvents: isSubmitting ? 'none' : 'auto',
            opacity: isSubmitting ? 0.6 : 1,
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
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
              sx={{
                minWidth: {
                  xs: '100%',
                  md: '220px',
                },
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
