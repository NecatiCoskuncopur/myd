import React, { useState, useTransition } from 'react';

import { Alert, Box, Button, Popover, Snackbar, Typography, useTheme } from '@mui/material';

import deletePricingList from '@/app/actions/admin/deletePricingList';
import StyledButton from '@/components/StyledButton';
import { generalMessages, pricingListMessages } from '@/constants';

type DeleteListProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onSuccess?: (message: string) => void;
  list: PricingListTypes.IPricingList | null;
};

const { UNEXPECTED_ERROR } = generalMessages;

const DeleteList = ({ open, anchorEl, onClose, onSuccess, list }: DeleteListProps) => {
  const theme = useTheme();
  const [pending, startTransition] = useTransition();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const handleDelete = () => {
    if (!list?._id) return;

    startTransition(async () => {
      const response = await deletePricingList(list._id);

      if (response.status === 'ERROR') {
        setSnackbar({
          open: true,
          severity: 'error',
          message: response.message ?? UNEXPECTED_ERROR,
        });
        return;
      }
      onClose();

      const successMsg = response.message ?? pricingListMessages.DELETE.SUCCESS;
      setSnackbar({
        open: true,
        message: successMsg,
        severity: 'success',
      });

      onSuccess?.(successMsg);
    });
  };

  return (
    <>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              p: 2,
              maxWidth: 300,
              backgroundImage: 'none',
              backgroundColor: theme.palette.dashboard.sidebar,
              border: `1px solid ${theme.palette.dashboard.border}`,
              boxShadow: theme.shadows[8],
            },
          },
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Fiyat Listesini Sil
        </Typography>

        <Typography variant="body2" sx={{ color: theme.palette.dashboard.textSidebar, mb: 1.5 }}>
          <strong>"{list?.name}"</strong> isimli listeyi silmek istediğinize emin misiniz?
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button size="small" onClick={onClose} disabled={pending}>
            İptal
          </Button>
          <StyledButton size="small" onClick={handleDelete} variant="contained" color="error" disabled={pending}>
            Evet, Sil
          </StyledButton>
        </Box>
      </Popover>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() =>
          setSnackbar(prev => ({
            ...prev,
            open: false,
          }))
        }
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DeleteList;
