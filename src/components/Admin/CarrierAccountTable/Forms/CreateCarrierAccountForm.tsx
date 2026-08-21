import React, { useEffect, useTransition } from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, useTheme } from '@mui/material';
import { useForm, useWatch } from 'react-hook-form';

import createCarrierAccount from '@/app/actions/admin/createCarrierAccount';
import { StyledButton } from '@/components';
import { Carrier, CarrierAccountTypeEnum, carrierConfig, carrierMessages, generalMessages } from '@/constants';
import { CarrierAccountTypes } from '@/types/carrierAccount';
import FormItems from './FormItems';
import { useSnackbar } from '@/providers/SnackbarProvider';

type CreateCarrierAccountProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

const { CREATE } = carrierMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const CreateCarrierAccountForm = ({ open, onClose, onSuccess }: CreateCarrierAccountProps) => {
  const theme = useTheme();
  const [isPending, startTransition] = useTransition();

  const { showSnackbar } = useSnackbar();

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CarrierAccountTypes.ICreateCarrierAccountPayload>({
    defaultValues: {
      name: '',
      displayName: '',
      accountNumber: '',
      carrier: Carrier.FEDEX,
      accountType: CarrierAccountTypeEnum.ECONOMY,
      credentials: carrierConfig[Carrier.FEDEX]?.credentials?.map(credential => ({ ...credential })) ?? [],
      pricing: {},
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
    if (!selectedCarrier) return;

    const credentials = carrierConfig[selectedCarrier]?.credentials ?? [];

    setValue(
      'credentials',
      credentials.map(credential => ({ ...credential })),
    );
  }, [selectedCarrier, setValue]);

  const onSubmit = (data: CarrierAccountTypes.ICreateCarrierAccountPayload) => {
    startTransition(async () => {
      const response = await createCarrierAccount(data);

      if (response.status === 'ERROR') {
        showSnackbar(response.message ?? UNEXPECTED_ERROR, 'error');
        return;
      }

      showSnackbar(response.message ?? CREATE.SUCCESS, 'success');

      reset();
      onSuccess?.();
      onClose();
    });
  };

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              backgroundImage: 'none',
              backgroundColor: theme.palette.dashboard.sidebar,
            },
          },
        }}
      >
        <form>
          <DialogTitle>Kargo Hesabı Oluştur</DialogTitle>
          <DialogContent>
            <FormItems mode="create" control={control} setValue={setValue} credentials={credentials} hasCustomInfo={hasCustomInfo} errors={errors} />
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={onClose} color="inherit" disabled={isPending}>
              İptal
            </Button>
            <StyledButton type="button" onClick={handleSubmit(onSubmit)} variant="contained" loading={isPending}>
              Kaydet
            </StyledButton>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default CreateCarrierAccountForm;
