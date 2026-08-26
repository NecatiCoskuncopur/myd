'use client';

import { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField } from '@mui/material';
import type { ChangeEvent } from 'react';

import updatePackageDimensions from '@/app/actions/admin/updatePackageDimensions';
import { shippingMessages } from '@/constants';
import { ShippingTypes } from '@/types/shipping';

import StyledButton from '../../StyledButton';

interface PackageDimensionsDialogProps {
  open: boolean;
  shipping: ShippingTypes.IShipping | null;
  onClose: () => void;
  onSuccess: () => void;
  showSnackbar: (message: string, severity: 'success' | 'error') => void;
}

const { UPDATESHIPPING } = shippingMessages;

const PackageDimensionsDialog = ({ open, shipping, onClose, onSuccess, showSnackbar }: PackageDimensionsDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    weight: '',
    width: '',
    height: '',
    length: '',
  });

  useEffect(() => {
    if (!shipping || !open) {
      return;
    }

    setForm({
      weight: String(shipping.package?.weight ?? ''),
      width: String(shipping.package?.width ?? ''),
      height: String(shipping.package?.height ?? ''),
      length: String(shipping.package?.length ?? ''),
    });
  }, [shipping, open]);

  const handleChange = (field: keyof typeof form) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleClose = () => {
    if (isLoading) {
      return;
    }

    onClose();
  };

  const handleSubmit = async () => {
    if (!shipping?._id) {
      return;
    }

    const weight = Number(form.weight);
    const width = Number(form.width);
    const height = Number(form.height);
    const length = Number(form.length);

    if (!Number.isFinite(weight) || !Number.isFinite(width) || !Number.isFinite(height) || !Number.isFinite(length)) {
      showSnackbar('Lütfen tüm paket bilgilerini eksiksiz girin.', 'error');

      return;
    }

    if (weight <= 0 || width <= 0 || height <= 0 || length <= 0) {
      showSnackbar('Paket değerleri 0’dan büyük olmalıdır.', 'error');

      return;
    }

    setIsLoading(true);

    try {
      const response = await updatePackageDimensions({
        shippingId: shipping._id,
        weight,
        width,
        height,
        length,
      });

      if (response.status !== 'OK') {
        showSnackbar(response.message ?? 'Paket bilgileri güncellenemedi.', 'error');

        return;
      }

      showSnackbar(UPDATESHIPPING.SUCCESS, 'success');

      onClose();
      onSuccess();
    } catch {
      showSnackbar('Paket bilgileri güncellenirken bir hata oluştu.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: theme => ({
            backgroundImage: 'none',
            backgroundColor: theme.palette.dashboard.sidebar,
          }),
        },
      }}
    >
      <DialogTitle>Paket Bilgilerini Güncelle</DialogTitle>

      <DialogContent>
        <Grid spacing={2} container sx={{ mt: 1 }}>
          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <TextField label="Ağırlık (kg)" type="number" value={form.weight} onChange={handleChange('weight')} fullWidth />
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <TextField label="En (cm)" type="number" value={form.width} onChange={handleChange('width')} fullWidth />
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <TextField label="Boy (cm)" type="number" value={form.length} onChange={handleChange('length')} fullWidth />
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <TextField label="Yükseklik (cm)" type="number" value={form.height} onChange={handleChange('height')} fullWidth />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button type="button" onClick={handleClose} disabled={isLoading}>
          İptal
        </Button>

        <StyledButton type="button" variant="contained" onClick={handleSubmit} loading={isLoading} disabled={isLoading}>
          Güncelle
        </StyledButton>
      </DialogActions>
    </Dialog>
  );
};

export default PackageDimensionsDialog;
