'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { Box, Button, Popover, Typography, useTheme } from '@mui/material';

import deleteShipping from '../app/actions/shipping/deleteShipping';

type DeleteShippingProps = {
  open: boolean;
  id: string;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onSuccess?: () => void;
};

const DeleteShipping = ({ open, id, anchorEl, onClose, onSuccess }: DeleteShippingProps) => {
  const theme = useTheme();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!id) return;

    // Pop-up'ı beklemeden ANINDA kapat
    onClose();

    startTransition(async () => {
      try {
        const response = await deleteShipping(id);

        if (response.status === 'OK') {
          if (onSuccess) onSuccess();
          router.refresh();
        } else {
          console.error(response.message || 'Silme işlemi başarısız oldu.');
        }
      } catch (error) {
        console.error('Beklenmedik bir hata oluştu:', error);
      }
    });
  };

  return (
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
  );
};

export default DeleteShipping;
