import React, { useState, useTransition } from 'react';

import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Typography, Box, useTheme } from '@mui/material';

import deletePricingList from '@/app/actions/admin/deletePricingList';
import StyledButton from '@/components/StyledButton';
import { generalMessages, pricingListMessages } from '@/constants';

type DeleteListProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  list: PricingListTypes.IPricingList | null;
};

const { UNEXPECTED_ERROR } = generalMessages;

const DeleteList = ({ open, onClose, onSuccess, list }: DeleteListProps) => {
  const theme = useTheme();
  const [pending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const handleDelete = () => {
    if (!list?._id) return;
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const res = await deletePricingList(list._id);

        if (res.status === 'ERROR') {
          setErrorMessage(res.message ?? UNEXPECTED_ERROR);
          return;
        }

        setSnackbar({
          open: true,
          message: res.message ?? pricingListMessages.DELETE?.SUCCESS,
          severity: 'success',
        });

        setTimeout(() => {
          onSuccess?.();
        }, 1000);
      } catch (error) {
        console.error('Delete pricing list failed:', error);
        setErrorMessage(UNEXPECTED_ERROR);
      }
    });
  };

  const handleClose = () => {
    setErrorMessage(null);
    onClose?.();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: { backgroundImage: 'none', backgroundColor: theme.palette.dashboard.sidebar },
          },
        }}
      >
        <DialogTitle>Fiyat Listesini Sil</DialogTitle>

        <DialogContent>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <DialogContentText sx={{ color: theme.palette.dashboard.textSidebar }}>
            <Typography component="span" variant="body1" sx={{ display: 'block', mb: 1 }}>
              <strong>"{list?.name}"</strong> isimli fiyat listesini silmek istediğinize emin misiniz?
            </Typography>

            <Box
              component="span"
              sx={{
                color: theme.palette.warning.main,
                display: 'block',
                mt: 2,
                fontSize: '0.85rem',
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                p: 1.5,
                borderRadius: '6px',
                border: `1px dashed ${theme.palette.warning.main}`,
              }}
            >
              <strong>Not:</strong> Bu işlem geri alınamaz. Bu listeye atanmış olan tüm kullanıcılar otomatik olarak sistemin{' '}
              <strong>Varsayılan Fiyat Listesine</strong> geçirilecektir.
            </Box>
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={pending}>
            İptal
          </Button>
          <StyledButton onClick={handleDelete} variant="contained" color="error" disabled={pending}>
            {pending ? 'Siliniyor...' : 'Evet, Sil'}
          </StyledButton>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DeleteList;
