'use client';

import { useEffect, useState, useTransition } from 'react';

import { AddCircleOutlined } from '@mui/icons-material';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Stack, useTheme } from '@mui/material';
import { useForm } from 'react-hook-form';

import addTransactionUserBalance from '@/app/actions/admin/addTransactionUserBalance';
import StyledButton from '@/components/StyledButton';
import { generalMessages, transactionMessages } from '@/constants';
import FormItems from './FormItems';
import { AdminTypes } from '@/types/admin';

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

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const onSubmit = (values: AdminTypes.IAddTransactionUserBalancePayload) => {
    startTransition(async () => {
      try {
        const response = await addTransactionUserBalance(values);

        if (response.status === 'ERROR') {
          setSnackbar({
            open: true,
            severity: 'error',
            message: response.message ?? UNEXPECTED_ERROR,
          });
          return;
        }

        setSnackbar({
          open: true,
          message: response.message ?? SUCCESS,
          severity: 'success',
        });

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

        setSnackbar({
          open: true,
          severity: 'error',
          message: UNEXPECTED_ERROR,
        });
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() =>
          setSnackbar({
            open: false,
            message: '',
            severity: 'success',
          })
        }
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddTransaction;
