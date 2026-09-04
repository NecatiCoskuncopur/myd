'use client';

import { useState } from 'react';
import { Box, Button, Popover, Typography } from '@mui/material';

import deleteSysParam from '@/app/actions/sysParam/deleteSysParam';
import { StyledButton } from '@/components';
import { generalMessages, sysParamMessages } from '@/constants';
import { useSnackbar } from '@/providers/SnackbarProvider';

type DeleteParamProps = {
  open: boolean;
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
  onSuccess?: () => void;
  param: SysParamTypes.ISysParam | null;
};

const { UNEXPECTED_ERROR } = generalMessages;

const DeleteSysParam = ({ open, anchorEl, onClose, onSuccess, param }: DeleteParamProps) => {
  const { showSnackbar } = useSnackbar();

  const [isDeleting, setIsDeleting] = useState(false);

  const handleClose = () => {
    if (isDeleting) {
      return;
    }

    onClose();
  };

  const handleDelete = async () => {
    if (!param?._id) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await deleteSysParam(param._id);

      if (response.status === 'ERROR') {
        showSnackbar(response.message ?? UNEXPECTED_ERROR, 'error');

        return;
      }

      showSnackbar(response.message ?? sysParamMessages.DELETE.SUCCESS, 'success');

      onSuccess?.();
      onClose();
    } catch {
      showSnackbar(UNEXPECTED_ERROR, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
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
            maxWidth: 300,
            backgroundImage: 'none',
            backgroundColor: theme.palette.dashboard.sidebar,
            border: `1px solid ${theme.palette.dashboard.border}`,
            boxShadow: theme.shadows[8],
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
        Sistem Parametresini Sil
      </Typography>

      <Typography
        variant="body2"
        sx={theme => ({
          color: theme.palette.dashboard.textSidebar,
          mb: 1.5,
        })}
      >
        <strong>"{param?.key}"</strong> anahtarını silmek istediğinize emin misiniz?
      </Typography>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1,
        }}
      >
        <Button type="button" size="small" onClick={handleClose} disabled={isDeleting}>
          İptal
        </Button>

        <StyledButton type="button" size="small" onClick={handleDelete} variant="contained" color="error" loading={isDeleting} disabled={isDeleting}>
          Evet, Sil
        </StyledButton>
      </Box>
    </Popover>
  );
};

export default DeleteSysParam;
