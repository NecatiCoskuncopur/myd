'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';

import deleteShipping from '@/app/actions/shipping/deleteShipping';
import getUser from '@/app/actions/user/getUser';
import { generalMessages, shippingMessages, userMessages } from '@/constants';

const { DELETE } = shippingMessages;
const { UNEXPECTED_ERROR } = generalMessages;
const { NOT_FOUND } = userMessages;

type HeaderProps = {
  hasTrackingNumber: boolean;
  id: string;
};

const Header = ({ hasTrackingNumber, id }: HeaderProps) => {
  const router = useRouter();
  const theme = useTheme();
  const [isPending, startTransition] = useTransition();
  const [openDialog, setOpenDialog] = useState(false);
  const [user, setUser] = useState<UserTypes.IUser | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const response = await deleteShipping(id);

        if (response.status === 'OK') {
          setSnackbar({
            open: true,
            message: response.message || DELETE.SUCCESS,
            severity: 'success',
          });

          handleCloseDialog();

          setTimeout(() => {
            router.replace('/panel/gonderilerim');
          }, 1200);
        } else {
          setSnackbar({
            open: true,
            message: response.message || DELETE.ERROR,
            severity: 'error',
          });
        }
      } catch {
        setSnackbar({
          open: true,
          message: UNEXPECTED_ERROR,
          severity: 'error',
        });
      }
    });
  };

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
        <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlineIcon />}
            onClick={handleOpenDialog}
            sx={{ borderColor: 'error.main', color: 'error.main' }}
          >
            Sil
          </Button>

          <Button variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => router.push(`/panel/gonderilerim/${id}/duzenle`)}>
            Düzenle
          </Button>

          {(user?.barcodePermits?.length ?? 0) > 0 && (
            <Button variant="outlined" startIcon={<QrCode2OutlinedIcon />}>
              Barkod oluştur
            </Button>
          )}
        </Stack>
      )}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            backgroundImage: 'none',
            backgroundColor: theme.palette.dashboard.sidebar,
            color: theme.palette.dashboard.textSidebar,
          },
        }}
      >
        <DialogTitle>Gönderiyi Sil?</DialogTitle>
        <DialogContent>
          <DialogContentText>Bu gönderiyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} disabled={isPending}>
            Vazgeç
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={isPending}
            startIcon={isPending && <CircularProgress size={16} color="inherit" />}
          >
            {isPending ? '' : 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Header;
