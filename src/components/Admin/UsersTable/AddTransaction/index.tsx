'use client';

import { useEffect, useTransition } from 'react';

import { AddCircleOutlined } from '@mui/icons-material';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, useTheme } from '@mui/material';
import { useForm } from 'react-hook-form';

import addTransactionUserBalance from '@/app/actions/admin/addTransactionUserBalance';
import StyledButton from '@/components/StyledButton';
import { generalMessages, transactionMessages } from '@/constants';
import FormItems from './FormItems';
import { AdminTypes } from '@/types/admin';
import { useSnackbar } from '@/providers/SnackbarProvider';

const { SUCCESS } = transactionMessages;
const { UNEXPECTED_ERROR } = generalMessages;

interface Props {
  userId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddTransaction = ({ userId, open, onClose, onSuccess }: Props) => {
  const [pending, startTransition] = useTransition();
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdminTypes.IAddTransactionUserBalancePayload>({
    defaultValues: {
      userId,
      amount: 0,
      type: 'PAY',
      note: '',
    },
  });

  useEffect(() => {
    reset({
      userId,
      amount: 0,
      type: 'PAY',
      note: '',
    });
  }, [userId, reset]);

  const { showSnackbar } = useSnackbar();

  const onSubmit = (values: AdminTypes.IAddTransactionUserBalancePayload) => {
    startTransition(async () => {
      try {
        const response = await addTransactionUserBalance(values);

        if (response.status === 'ERROR') {
          showSnackbar(response.message ?? UNEXPECTED_ERROR, 'error');
          return;
        }

        showSnackbar(response.message ?? SUCCESS, 'success');

        onSuccess?.();
        reset({
          userId,
          amount: 0,
          type: 'PAY',
          note: '',
        });
        onClose();
      } catch (error) {
        console.error('Add transaction failed:', error);

        showSnackbar(UNEXPECTED_ERROR, 'error');
      }
    });
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
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
        <DialogTitle>Bakiye Hareketi Ekle</DialogTitle>

        <Box component="form" noValidate>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <FormItems control={control} errors={errors} />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={onClose} disabled={pending}>
              İptal
            </Button>

            <StyledButton
              type="button"
              onClick={handleSubmit(onSubmit)}
              variant="contained"
              disabled={pending}
              startIcon={pending ? <CircularProgress size={18} /> : <AddCircleOutlined />}
            >
              Ekle
            </StyledButton>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
};

export default AddTransaction;
