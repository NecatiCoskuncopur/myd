'use client';

import { Box, Typography } from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';

import updateShipping from '@//app/actions/shipping/updateShipping';
import { generalMessages, shippingMessages } from '@//constants';
import { useSnackbar } from '@//providers/SnackbarProvider';
import { ShippingTypes } from '@//types/shipping';
import StyledButton from '@/components/StyledButton';

import ShippingFormFields from './ShippingFormFields';

const { UPDATESHIPPING } = shippingMessages;
const { UNEXPECTED_ERROR } = generalMessages;

type EditShippingFormProps = {
  initialValues: ShippingTypes.IUpdateShippingPayload;
};

const EditShippingForm = ({ initialValues }: EditShippingFormProps) => {
  const { showSnackbar } = useSnackbar();

  const methods = useForm<ShippingTypes.IUpdateShippingPayload>({
    defaultValues: initialValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (values: ShippingTypes.IUpdateShippingPayload) => {
    try {
      const response = await updateShipping(values);

      if (response.status !== 'OK') {
        showSnackbar(response.message ?? UNEXPECTED_ERROR, 'error');

        return;
      }

      showSnackbar(response.message ?? UPDATESHIPPING.SUCCESS, 'success');
    } catch {
      showSnackbar(UNEXPECTED_ERROR, 'error');
    }
  };

  return (
    <Box
      sx={theme => ({
        width: '100%',
        backgroundColor: theme.palette.dashboard.sidebar,
        color: theme.palette.dashboard.textSidebar,
        p: 3,
        borderRadius: '12px',
      })}
    >
      <Typography variant="h5" sx={{ mb: 3 }}>
        Gönderiyi Güncelle
      </Typography>

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
          <ShippingFormFields />

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
              Değişiklikleri Kaydet
            </StyledButton>
          </Box>
        </Box>
      </FormProvider>
    </Box>
  );
};

export default EditShippingForm;
