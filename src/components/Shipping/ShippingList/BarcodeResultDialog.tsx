'use client';

import { Alert, Box, CircularProgress, Dialog, DialogContent, Typography } from '@mui/material';

type BarcodeResultDialogProps = {
  open: boolean;
  loading: boolean;
  error: string | null;
  onClose: () => void;
};

const BarcodeResultDialog = ({ open, loading, error, onClose }: BarcodeResultDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent
        sx={{
          minWidth: 300,
          textAlign: 'center',
        }}
      >
        {loading ? (
          <Box>
            <CircularProgress />

            <Typography sx={{ mt: 2 }}>Barkod oluşturuluyor...</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" onClose={onClose}>
            {error}
          </Alert>
        ) : (
          <Typography>Barkod başarıyla oluşturuldu.</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BarcodeResultDialog;
