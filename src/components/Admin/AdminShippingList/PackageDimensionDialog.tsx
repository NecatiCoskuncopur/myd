'use client';

import React, { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';

import updatePackageDimensions from '@/app/actions/admin/updatePackageDimensions';
import { ShippingTypes } from '@/types/shipping';
import { shippingMessages } from '@/constants';

interface PackageDimensionsDialogProps {
  open: boolean;
  shipping: ShippingTypes.IShipping | null;
  onClose: () => void;
  onSuccess: () => void;
  showSnackbar: (message: string, severity: 'success' | 'error') => void;
}
const { UPDATESHIPPING } = shippingMessages;
const PackageDimensionsDialog = ({ open, shipping, onClose, onSuccess, showSnackbar }: PackageDimensionsDialogProps) => {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    weight: '',
    numberOfPackage: '',
    width: '',
    height: '',
    length: '',
  });

  useEffect(() => {
    if (!shipping || !open) return;

    setForm({
      weight: String(shipping.package?.weight ?? ''),
      numberOfPackage: String(shipping.package?.numberOfPackage ?? 1),
      width: String(shipping.package?.width ?? ''),
      height: String(shipping.package?.height ?? ''),
      length: String(shipping.package?.length ?? ''),
    });
  }, [shipping, open]);

  const handleChange = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (!shipping?._id) return;

    const weight = Number(form.weight);
    const numberOfPackage = Number(form.numberOfPackage);
    const width = Number(form.width);
    const height = Number(form.height);
    const length = Number(form.length);

    if (!Number.isFinite(weight) || !Number.isFinite(numberOfPackage) || !Number.isFinite(width) || !Number.isFinite(height) || !Number.isFinite(length)) {
      showSnackbar('Lütfen tüm paket bilgilerini eksiksiz girin.', 'error');
      return;
    }

    if (weight <= 0 || numberOfPackage <= 0 || width <= 0 || height <= 0 || length <= 0) {
      showSnackbar('Paket değerleri 0’dan büyük olmalıdır.', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await updatePackageDimensions({
        shippingId: shipping._id,
        weight,
        numberOfPackage,
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
    } catch (error) {
      showSnackbar('Paket bilgileri güncellenirken bir hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => !loading && onClose()} fullWidth maxWidth="sm">
      <DialogTitle>Paket Bilgilerini Güncelle</DialogTitle>

      <DialogContent>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 2,
            mt: 1,
          }}
        >
          <TextField label="Ağırlık (kg)" type="number" value={form.weight} onChange={handleChange('weight')} fullWidth />
          <TextField label="Paket Sayısı" type="number" value={form.numberOfPackage} onChange={handleChange('numberOfPackage')} fullWidth />
          <TextField label="En (cm)" type="number" value={form.width} onChange={handleChange('width')} fullWidth />
          <TextField label="Boy (cm)" type="number" value={form.length} onChange={handleChange('length')} fullWidth />
          <TextField label="Yükseklik (cm)" type="number" value={form.height} onChange={handleChange('height')} fullWidth />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          İptal
        </Button>

        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <CircularProgress size={18} sx={{ mr: 1 }} />
              Kaydediliyor...
            </>
          ) : (
            'Kaydet'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PackageDimensionsDialog;
