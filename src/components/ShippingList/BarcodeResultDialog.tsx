'use client';

import { Alert, Box, CircularProgress, Dialog, DialogContent, Typography } from '@mui/material';

interface BarcodeResultDialogProps {
  open: boolean;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onClearError: () => void;
}

const BarcodeResultDialog = ({ open, loading, error, onClose, onClearError }: BarcodeResultDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent
        sx={{
          minWidth: 300,
          textAlign: 'center',
        }}
      >
        {loading && (
          <Box>
            <CircularProgress />

            <Typography sx={{ mt: 2 }}>Barkod oluşturuluyor...</Typography>
          </Box>
        )}

        {!loading && error && (
          <Alert severity="error" onClose={onClearError}>
            {error}
          </Alert>
        )}

        {!loading && !error && <Typography>Barkod başarıyla oluşturuldu</Typography>}
      </DialogContent>
    </Dialog>
  );
};

export default BarcodeResultDialog;
