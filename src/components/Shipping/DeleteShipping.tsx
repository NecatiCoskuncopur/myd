'use client';

import { useState } from 'react';
import { Box, Button, Popover, Typography } from '@mui/material';

import deleteShipping from '@//app/actions/shipping/deleteShipping';
import { shippingMessages } from '@//constants';
import { useSnackbar } from '@//providers/SnackbarProvider';

const { DELETE } = shippingMessages;

type DeleteShippingProps = {
  open: boolean;
  id: string;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onSuccess?: () => void;
};

const DeleteShipping = ({ open, id, anchorEl, onClose, onSuccess }: DeleteShippingProps) => {
  const { showSnackbar } = useSnackbar();

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await deleteShipping(id);

      if (response.status !== 'OK') {
        showSnackbar(response.message ?? DELETE.ERROR, 'error');

        return;
      }

      showSnackbar(response.message ?? DELETE.SUCCESS, 'success');

      onClose();
      onSuccess?.();
    } catch {
      showSnackbar(DELETE.ERROR, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={isDeleting ? undefined : onClose}
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
          sx: theme => ({
            p: 2,
            maxWidth: 290,
            backgroundImage: 'none',
            backgroundColor: theme.palette.dashboard.sidebar,
            border: '1px solid',
            borderColor: theme.palette.dashboard.border,
            boxShadow: theme.shadows[8],
            borderRadius: 2,
          }),
        },
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 600,
          mb: 1,
        }}
      >
        Gönderiyi Sil?
      </Typography>

      <Typography
        variant="body2"
        sx={theme => ({
          color: theme.palette.dashboard.textSidebar,
          mb: 2,
          opacity: 0.9,
        })}
      >
        Bu gönderiyi silmek istediğinize emin misiniz?
      </Typography>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1,
        }}
      >
        <Button
          type="button"
          size="small"
          onClick={onClose}
          disabled={isDeleting}
          sx={theme => ({
            color: theme.palette.dashboard.textSidebar,
          })}
        >
          Vazgeç
        </Button>

        <Button type="button" size="small" color="error" variant="contained" loading={isDeleting} disabled={isDeleting} onClick={handleDelete}>
          Evet, Sil
        </Button>
      </Box>
    </Popover>
  );
};

export default DeleteShipping;
