'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DeleteOutlined, EditOutlined } from '@mui/icons-material';
import { Button, Stack, Typography } from '@mui/material';
import type { MouseEvent } from 'react';

import { CreateBarcodeButton, DeleteShipping } from '@/components/index';
import { shippingMessages } from '@/constants';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { ShippingTypes } from '@/types/shipping';

const { DELETE } = shippingMessages;

type HeaderProps = {
  id: string;
  shipping: ShippingTypes.IShipping;
  canCreateBarcode: boolean;
  onShippingRefresh: () => void;
};

const Header = ({ id, shipping, canCreateBarcode, onShippingRefresh }: HeaderProps) => {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const hasTrackingNumber = Boolean(shipping.carrier?.trackingNumber);

  const handleOpenDelete = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseDelete = () => {
    setAnchorEl(null);
  };

  const handleDeleteSuccess = () => {
    showSnackbar(DELETE.SUCCESS, 'success');
    router.replace('/panel/gonderilerim');
  };

  return (
    <>
      <Typography variant="h5">Gönderi Detayı</Typography>

      {!hasTrackingNumber && (
        <Stack
          spacing={2}
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          sx={{
            width: {
              xs: '100%',
              sm: 'auto',
            },
          }}
        >
          <Button variant="outlined" color="error" startIcon={<DeleteOutlined />} onClick={handleOpenDelete}>
            Sil
          </Button>

          <Button variant="outlined" startIcon={<EditOutlined />} onClick={() => router.push(`/panel/gonderilerim/${id}/duzenle`)}>
            Düzenle
          </Button>

          {canCreateBarcode && <CreateBarcodeButton shipping={shipping} onSuccess={onShippingRefresh} />}
        </Stack>
      )}
      <DeleteShipping open={Boolean(anchorEl)} id={id} anchorEl={anchorEl} onClose={handleCloseDelete} onSuccess={handleDeleteSuccess} />
    </>
  );
};

export default Header;
