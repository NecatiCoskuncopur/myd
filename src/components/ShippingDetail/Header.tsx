'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { DeleteOutlined, EditOutlined } from '@mui/icons-material';
import { Button, Stack, Typography } from '@mui/material';

import getUser from '@/app/actions/user/getUser';
import { shippingMessages, userMessages } from '@/constants';
import { UserTypes } from '@/types/user';
import { CreateBarcodeButton, DeleteShipping } from '@/components';
import { ShippingTypes } from '@/types/shipping';
import { useSnackbar } from '@/providers/SnackbarProvider';

const { DELETE } = shippingMessages;
const { NOT_FOUND } = userMessages;

type HeaderProps = {
  hasTrackingNumber: boolean;
  id: string;
  shipping: ShippingTypes.IShipping;
  handleShippingRefresh: () => void;
};

const Header = ({ hasTrackingNumber, id, shipping, handleShippingRefresh }: HeaderProps) => {
  const router = useRouter();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [user, setUser] = useState<UserTypes.UserDto | null>(null);

  const { showSnackbar } = useSnackbar();

  const handleOpenDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseDelete = () => {
    setAnchorEl(null);
  };

  const handleDeleteSuccess = () => {
    showSnackbar(DELETE.SUCCESS, 'success');

    setTimeout(() => {
      router.replace('/panel/gonderilerim');
    }, 1200);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const result = await getUser();
      if (result.status === 'OK' && result.data) {
        setUser(result.data);
      } else {
        showSnackbar(result.message || NOT_FOUND, 'error');
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

          {(user?.barcodePermits?.length ?? 0) > 0 && <CreateBarcodeButton shipping={shipping} onSuccess={handleShippingRefresh} />}
        </Stack>
      )}
      <DeleteShipping open={Boolean(anchorEl)} id={id} anchorEl={anchorEl} onClose={handleCloseDelete} onSuccess={handleDeleteSuccess} />
    </>
  );
};

export default Header;
