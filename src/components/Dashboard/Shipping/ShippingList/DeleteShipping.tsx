'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, useTheme } from '@mui/material';

import deleteShipping from '@/app/actions/shipping/deleteShipping';

type DeleteShippingProps = {
  open: boolean;
  id: string;
  onClose: () => void;
  onSuccess?: () => void;
};

const DeleteShipping = ({ open, id, onClose, onSuccess }: DeleteShippingProps) => {
  const theme = useTheme();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      try {
        const response = await deleteShipping(id);

        if (response.status === 'OK') {
          onClose();
          if (onSuccess) onSuccess();
          router.refresh();
        } else {
          setError(response.message || 'Silme işlemi başarısız oldu.');
        }
      } catch {
        setError('Beklenmedik bir hata oluştu.');
      }
    });
  };

  return (
    <Dialog
      open={open}
      onClose={isPending ? undefined : onClose}
      PaperProps={{
        sx: {
          backgroundImage: 'none',
          backgroundColor: theme.palette.dashboard.sidebar,
          color: theme.palette.dashboard.textSidebar,
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>Gönderiyi Sil?</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: 'inherit', opacity: 0.8 }}>Bu gönderiyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</DialogContentText>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={isPending} sx={{ color: theme.palette.dashboard.textSidebar }}>
          Vazgeç
        </Button>
        <Button
          onClick={handleDelete}
          color="error"
          variant="contained"
          disabled={isPending}
          startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {isPending ? '' : 'Sil'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteShipping;
