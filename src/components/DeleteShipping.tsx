'use client';

import React, { useState, useTransition } from 'react';

import { Alert, Box, Button, Popover, Snackbar, Typography, useTheme } from '@mui/material';

import deleteShipping from '../app/actions/shipping/deleteShipping';
import { shippingMessages } from '@/constants';

const { DELETE } = shippingMessages;

type DeleteShippingProps = {
  open: boolean;
  id: string;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onSuccess?: () => void;
};

const DeleteShipping = ({ open, id, anchorEl, onClose, onSuccess }: DeleteShippingProps) => {
  const theme = useTheme();
  const [isPending, startTransition] = useTransition();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const handleDelete = () => {
    if (!id) return;
    onClose();

    startTransition(async () => {
      const response = await deleteShipping(id);

      if (response.status === 'ERROR') {
        setSnackbar({
          open: true,
          severity: 'error',
          message: response.message ?? DELETE.ERROR,
        });
        return;
      }

      setSnackbar({
        open: true,
        message: response.message ?? DELETE.SUCCESS,
        severity: 'success',
      });

      onSuccess?.();
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
              maxWidth: 290,
              backgroundImage: 'none',
              backgroundColor: theme.palette.dashboard.sidebar,
              border: `1px solid ${theme.palette.dashboard.border}`,
              boxShadow: theme.shadows[8],
              borderRadius: 2,
            },
          },
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Gönderiyi Sil?
        </Typography>

        <Typography variant="body2" sx={{ color: theme.palette.dashboard.textSidebar, mb: 2, opacity: 0.9 }}>
          Bu gönderiyi silmek istediğinize emin misiniz?
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button size="small" onClick={onClose} disabled={isPending} sx={{ color: theme.palette.dashboard.textSidebar }}>
            Vazgeç
          </Button>
          <Button size="small" onClick={handleDelete} color="error" variant="contained" disabled={isPending}>
            Evet, Sil
          </Button>
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

export default DeleteShipping;
