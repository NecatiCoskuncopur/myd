'use client';

import { startTransition, useEffect, useState } from 'react';

import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, useTheme } from '@mui/material';
import { useForm } from 'react-hook-form';

import getPricingLists from '@/app/actions/admin/getPricingLists';
import setUser from '@/app/actions/admin/setUser';
import StyledButton from '@/components/StyledButton';
import { generalMessages, userMessages } from '@/constants';
import FormItems from './FormItems';

const { UNEXPECTED_ERROR } = generalMessages;
const { EDITUSER } = userMessages;

interface Props {
  open: boolean;
  onClose: () => void;
  user: UserTypes.IUser | null;
  onSuccess?: () => void;
}

const EditUser = ({ open, onClose, user, onSuccess }: Props) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pricingLists, setPricingLists] = useState<PricingListTypes.IPricingList[]>([]);
  const theme = useTheme();

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminTypes.ISetUserPayload>({
    defaultValues: {
      userId: '',
      firstName: '',
      lastName: '',
      company: '',
      phone: '',
      email: '',
      address: {
        line1: '',
        line2: '',
        district: '',
        city: '',
        postalCode: '',
      },
      role: 'CUSTOMER',
      isActive: true,
      priceListId: '',
      barcodePermits: [],
    },
  });

  useEffect(() => {
    if (!open) return;

    const fetchPricingLists = async () => {
      try {
        const result = await getPricingLists();

        if (result.status === 'OK' && result.data) {
          setPricingLists(result.data.pricingLists);
        } else {
          setErrorMessage(result.message ?? UNEXPECTED_ERROR);
        }
      } catch (error) {
        console.error('Fetch pricing lists failed:', error);
        setErrorMessage(UNEXPECTED_ERROR);
      }
    };

    fetchPricingLists();
  }, [open]);

  useEffect(() => {
    if (!user || pricingLists.length === 0) return;

    reset({
      userId: user._id,
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      company: user.company ?? '',
      phone: user.phone ?? '',
      email: user.email ?? '',
      address: {
        line1: user.address?.line1 ?? '',
        line2: user.address?.line2 ?? '',
        district: user.address?.district ?? '',
        city: user.address?.city ?? '',
        postalCode: user.address?.postalCode ?? '',
      },
      role: user.role,
      isActive: user.isActive,
      priceListId: user.priceListId?.toString() ?? '',
      barcodePermits: user.barcodePermits ?? [],
    });
  }, [user, pricingLists, reset]);

  useEffect(() => {
    if (!open) {
      reset();
      setErrorMessage(null);
    }
  }, [open, reset]);

  const onSubmit = (values: AdminTypes.ISetUserPayload) => {
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const response = await setUser(values);

        if (response.status === 'ERROR') {
          setErrorMessage(response.message ?? UNEXPECTED_ERROR);
          return;
        }

        setSnackbar({
          open: true,
          message: response.message ?? EDITUSER.SUCCESS,
          severity: 'success',
        });
        onSuccess?.();
        reset();
      } catch (error) {
        console.error('Update user failed:', error);
        setErrorMessage(UNEXPECTED_ERROR);
      }
    });
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundImage: 'none',
            backgroundColor: theme.palette.dashboard.sidebar,
          },
        }}
      >
        <DialogTitle>Üyeyi Düzenle</DialogTitle>

        <DialogContent dividers>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <FormItems control={control} errors={errors} pricingLists={pricingLists} />
        </DialogContent>

        <DialogActions sx={{ m: 2 }}>
          <Button onClick={onClose}>İptal</Button>

          <StyledButton variant="contained" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            Kaydet
          </StyledButton>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
};

export default EditUser;
