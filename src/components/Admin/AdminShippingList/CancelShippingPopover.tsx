'use client';

import { Box, Button, Popover, Typography } from '@mui/material';

import { ShippingTypes } from '@/types/shipping';

interface CancelShippingPopoverProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  shipping: ShippingTypes.IShipping | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CancelShippingPopover = ({ open, anchorEl, shipping, loading, onClose, onConfirm }: CancelShippingPopoverProps) => {
  const handleClose = () => {
    if (loading) {
      return;
    }

    onClose();
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
        Gönderiyi İptal Et
      </Typography>

      <Typography
        variant="body2"
        sx={theme => ({
          color: theme.palette.dashboard.textSidebar,
          mb: 2,
          opacity: 0.9,
        })}
      >
        {shipping?.carrier?.trackingNumber} takip numaralı gönderiyi iptal etmek istediğinize emin misiniz?
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
          disabled={loading}
          sx={theme => ({
            color: theme.palette.dashboard.textSidebar,
          })}
        >
          Vazgeç
        </Button>

        <Button type="button" size="small" color="error" variant="contained" loading={loading} disabled={loading} onClick={onConfirm}>
          Gönderiyi İptal Et
        </Button>
      </Box>
    </Popover>
  );
};

export default CancelShippingPopover;
