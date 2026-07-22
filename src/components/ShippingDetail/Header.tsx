'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { DeleteOutlined, EditOutlined } from '@mui/icons-material';
import { Alert, Button, Snackbar, Stack, Typography } from '@mui/material';

import getUser from '@/app/actions/user/getUser';
import { shippingMessages, userMessages } from '@/constants';
import { UserTypes } from '@/types/user';
import { CreateBarcodeButton, DeleteShipping } from '@/components';

const { DELETE } = shippingMessages;
const { NOT_FOUND } = userMessages;

type HeaderProps = {
  hasTrackingNumber: boolean;
  id: string;
  shipping: ShippingTypes.IShipping;
};

const Header = ({ hasTrackingNumber, id, shipping }: HeaderProps) => {
  const router = useRouter();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [user, setUser] = useState<UserTypes.ICleanUser | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleOpenDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseDelete = () => {
    setAnchorEl(null);
  };

  const handleDeleteSuccess = () => {
    setSnackbar({
      open: true,
      message: DELETE.SUCCESS,
      severity: 'success',
    });

    setTimeout(() => {
      router.replace('/panel/gonderilerim');
    }, 1200);
  };

  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  useEffect(() => {
    const fetchUser = async () => {
      const result = await getUser();
      if (result.status === 'OK' && result.data) {
        setUser(result.data);
      } else {
        setSnackbar({
          open: true,
          message: result.message || NOT_FOUND,
          severity: 'error',
        });
      }
    };
    fetchUser();
  }, []);

  return (
    <>
      <Typography variant="h5">Gönderi Detayı</Typography>

      {!hasTrackingNumber && (
        <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlined />}
            onClick={handleOpenDelete}
            sx={{ borderColor: 'error.main', color: 'error.main' }}
          >
            Sil
          </Button>

          <Button variant="outlined" startIcon={<EditOutlined />} onClick={() => router.push(`/panel/gonderilerim/${id}/duzenle`)}>
            Düzenle
          </Button>

          {(user?.barcodePermits?.length ?? 0) > 0 && <CreateBarcodeButton shipping={shipping} />}
        </Stack>
      )}
      <DeleteShipping open={Boolean(anchorEl)} id={id} anchorEl={anchorEl} onClose={handleCloseDelete} onSuccess={handleDeleteSuccess} />

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Header;
