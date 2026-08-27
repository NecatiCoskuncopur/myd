'use client';

import { useEffect } from 'react';
import { AddCircleOutlined } from '@mui/icons-material';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import { useForm } from 'react-hook-form';

import addTransactionUserBalance from '@/app/actions/admin/addTransactionUserBalance';
import StyledButton from '@/components/StyledButton';
import { generalMessages, transactionMessages } from '@/constants';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { AdminTypes } from '@/types/admin';

import FormItems from './FormItems';

const { SUCCESS } = transactionMessages;
const { UNEXPECTED_ERROR } = generalMessages;

interface Props {
  userId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddTransaction = ({ userId, open, onClose, onSuccess }: Props) => {
  const { showSnackbar } = useSnackbar();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminTypes.IAddTransactionUserBalancePayload>({
    defaultValues: {
      userId,
      amount: undefined,
      type: 'PAY',
      note: '',
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      userId,
      amount: undefined,
      type: 'PAY',
      note: '',
    });
  }, [open, userId, reset]);

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    onClose();
  };

  const onSubmit = async (values: AdminTypes.IAddTransactionUserBalancePayload) => {
    try {
      const response = await addTransactionUserBalance(values);

      if (response.status === 'ERROR') {
        showSnackbar(response.message ?? UNEXPECTED_ERROR, 'error');

        return;
      }

      showSnackbar(response.message ?? SUCCESS, 'success');

      reset({
        userId,
        amount: 0,
        type: 'PAY',
        note: '',
      });

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
      maxWidth="sm"
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
      <DialogTitle>Bakiye Hareketi Ekle</DialogTitle>

      <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormItems control={control} errors={errors} />
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
          }}
        >
          <Button type="button" onClick={handleClose} disabled={isSubmitting}>
            İptal
          </Button>

          <StyledButton type="submit" variant="contained" loading={isSubmitting} disabled={isSubmitting} startIcon={<AddCircleOutlined />}>
            Ekle
          </StyledButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default AddTransaction;
