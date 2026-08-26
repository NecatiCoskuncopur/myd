'use client';

import { useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useForm, useWatch } from 'react-hook-form';

import createCarrierAccount from '@/app/actions/admin/createCarrierAccount';
import { StyledButton } from '@/components';
import { Carrier, CarrierAccountTypeEnum, carrierConfig, carrierMessages, generalMessages } from '@/constants';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { CarrierAccountTypes } from '@/types/carrierAccount';

import FormItems from './FormItems';

type CreateCarrierAccountProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

const { CREATE } = carrierMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const CreateCarrierAccountForm = ({ open, onClose, onSuccess }: CreateCarrierAccountProps) => {
  const { showSnackbar } = useSnackbar();

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CarrierAccountTypes.ICreateCarrierAccountPayload>({
    defaultValues: {
      name: '',
      displayName: '',
      accountNumber: '',
      carrier: Carrier.FEDEX,
      accountType: CarrierAccountTypeEnum.ECONOMY,
      credentials:
        carrierConfig[Carrier.FEDEX]?.credentials?.map(credential => ({
          ...credential,
        })) ?? [],
      pricing: {
        zones: [],
      },
      hasCustomInfo: false,
      customInfo: {
        firstName: '',
        lastName: '',
        email: '',
        company: '',
        phone: '',
        address: {
          line1: '',
          line2: '',
          city: '',
          district: '',
          postalCode: '',
        },
      },
    },
  });

  const selectedCarrier = useWatch({
    control,
    name: 'carrier',
  });

  const hasCustomInfo = useWatch({
    control,
    name: 'hasCustomInfo',
  });

  const credentials = useWatch({
    control,
    name: 'credentials',
  });

  useEffect(() => {
    if (!selectedCarrier) {
      return;
    }

    const carrierCredentials = carrierConfig[selectedCarrier]?.credentials ?? [];

    setValue(
      'credentials',
      carrierCredentials.map(credential => ({
        ...credential,
      })),
    );
  }, [selectedCarrier, setValue]);

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    reset();
    onClose();
  };

  const onSubmit = async (data: CarrierAccountTypes.ICreateCarrierAccountPayload) => {
    try {
      const response = await createCarrierAccount(data);

      if (response.status === 'ERROR') {
        showSnackbar(response.message ?? UNEXPECTED_ERROR, 'error');

        return;
      }

      showSnackbar(response.message ?? CREATE.SUCCESS, 'success');

      reset();

      onSuccess?.();
      onClose();
    } catch {
      showSnackbar(UNEXPECTED_ERROR, 'error');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: theme => ({
            backgroundImage: 'none',
            backgroundColor: theme.palette.dashboard.sidebar,
          }),
        },
      }}
    >
      <DialogTitle>Kargo Hesabı Oluştur</DialogTitle>

      <DialogContent>
        <FormItems mode="create" control={control} setValue={setValue} credentials={credentials} hasCustomInfo={hasCustomInfo} errors={errors} />
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
        }}
      >
        <Button type="button" onClick={handleClose} color="inherit" disabled={isSubmitting}>
          İptal
        </Button>

        <StyledButton type="button" onClick={handleSubmit(onSubmit)} variant="contained" loading={isSubmitting} disabled={isSubmitting}>
          Kaydet
        </StyledButton>
      </DialogActions>
    </Dialog>
  );
};

export default CreateCarrierAccountForm;
