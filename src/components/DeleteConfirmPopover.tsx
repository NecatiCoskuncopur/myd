'use client';

import { ReactNode, useState } from 'react';
import { Box, Button, Popover, Typography } from '@mui/material';

import { generalMessages } from '@/constants';
import { useSnackbar } from '@/providers/SnackbarProvider';

type DeleteActionResponse = {
  status: 'OK' | 'ERROR';
  message?: string;
};

type DeleteConfirmPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onSuccess?: () => void;

  title: string;
  description: ReactNode;

  deleteAction: () => Promise<DeleteActionResponse>;

  successMessage: string;
  errorMessage?: string;

  confirmText?: string;
  cancelText?: string;
};

const { UNEXPECTED_ERROR } = generalMessages;

const DeleteConfirmPopover = ({
  open,
  anchorEl,
  onClose,
  onSuccess,
  title,
  description,
  deleteAction,
  successMessage,
  errorMessage = UNEXPECTED_ERROR,
  confirmText = 'Evet, Sil',
  cancelText = 'İptal',
}: DeleteConfirmPopoverProps) => {
  const { showSnackbar } = useSnackbar();

  const [isDeleting, setIsDeleting] = useState(false);

  const handleClose = () => {
    if (isDeleting) {
      return;
    }

    onClose();
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await deleteAction();

      if (response.status !== 'OK') {
        showSnackbar(response.message ?? errorMessage, 'error');

        return;
      }

      showSnackbar(response.message ?? successMessage, 'success');

      onClose();
      onSuccess?.();
    } catch {
      showSnackbar(errorMessage, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={isDeleting ? undefined : handleClose}
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
        {title}
      </Typography>

      <Typography
        variant="body2"
        sx={theme => ({
          color: theme.palette.dashboard.textSidebar,
          mb: 2,
          opacity: 0.9,
        })}
      >
        {description}
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
          onClick={handleClose}
          disabled={isDeleting}
          sx={theme => ({
            color: theme.palette.dashboard.textSidebar,
          })}
        >
          {cancelText}
        </Button>

        <Button type="button" size="small" color="error" variant="contained" onClick={handleDelete} loading={isDeleting} disabled={isDeleting}>
          {confirmText}
        </Button>
      </Box>
    </Popover>
  );
};

export default DeleteConfirmPopover;
