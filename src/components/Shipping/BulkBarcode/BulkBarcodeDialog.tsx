'use client';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';

import { getCountryFlagUrl } from '@/lib/getCountryFlags';
import getCountryTurkishName from '@/lib/getCountryTurkishName';
import { ShippingTypes } from '@/types/shipping';

export type BulkBarcodeStatus = 'waiting' | 'processing' | 'success' | 'error';

export interface BulkBarcodeItem {
  shipping: ShippingTypes.IShipping;
  status: BulkBarcodeStatus;
  error?: string;
}

interface BulkBarcodeDialogProps {
  open: boolean;
  loading: boolean;
  items: BulkBarcodeItem[];
  onClose: () => void;
}

const BulkBarcodeDialog = ({ open, loading, items, onClose }: BulkBarcodeDialogProps) => {
  const completedCount = items.filter(item => item.status === 'success' || item.status === 'error').length;

  const successCount = items.filter(item => item.status === 'success').length;

  const errorCount = items.filter(item => item.status === 'error').length;

  const renderStatus = (item: BulkBarcodeItem) => {
    switch (item.status) {
      case 'processing':
        return (
          <>
            <CircularProgress size={20} />

            <Typography variant="body2">Barkod oluşturuluyor...</Typography>
          </>
        );

      case 'success':
        return (
          <>
            <CheckCircleIcon color="success" />

            <Typography variant="body2" color="success.main">
              Barkod oluşturuldu
            </Typography>
          </>
        );

      case 'error':
        return (
          <>
            <ErrorIcon color="error" />

            <Typography
              variant="body2"
              color="error.main"
              sx={{
                wordBreak: 'break-word',
              }}
            >
              {item.error ?? 'Barkod oluşturulamadı.'}
            </Typography>
          </>
        );

      default:
        return (
          <>
            <RadioButtonUncheckedIcon color="disabled" />

            <Typography variant="body2" color="text.secondary">
              Bekliyor
            </Typography>
          </>
        );
    }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Toplu Barkod Oluşturma</DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          <Box>
            {loading ? (
              <Typography variant="body2">
                {completedCount} / {items.length} gönderi işlendi
              </Typography>
            ) : (
              <Stack direction="row" spacing={2}>
                <Typography variant="body2" color="success.main">
                  {successCount} başarılı
                </Typography>

                {errorCount > 0 && (
                  <Typography variant="body2" color="error.main">
                    {errorCount} başarısız
                  </Typography>
                )}
              </Stack>
            )}
          </Box>

          <Stack spacing={1}>
            {items.map(item => {
              const countryCode = item.shipping.consignee.address.country;
              const countryName = getCountryTurkishName(countryCode);
              const flagUrl = getCountryFlagUrl(countryCode);
              return (
                <Box
                  key={item.shipping._id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    p: 1.5,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Box
                    sx={{
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                      }}
                    >
                      {item.shipping.consignee.name}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={0.75}
                      sx={{
                        alignItems: 'center',
                        mt: 0.25,
                      }}
                    >
                      {flagUrl && (
                        <img
                          src={flagUrl}
                          alt={countryCode}
                          style={{
                            width: '20px',
                            height: '14px',
                            objectFit: 'cover',
                            borderRadius: '2px',
                            display: 'block',
                            flexShrink: 0,
                          }}
                        />
                      )}

                      <Typography variant="caption" color="text.secondary">
                        {countryName}
                      </Typography>
                    </Stack>
                  </Box>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      minWidth: 0,
                      maxWidth: '60%',
                    }}
                  >
                    {renderStatus(item)}
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Kapat
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkBarcodeDialog;
