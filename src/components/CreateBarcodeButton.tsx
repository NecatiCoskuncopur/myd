'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Alert, Box, Button, CircularProgress, ClickAwayListener, Dialog, DialogContent, Paper, Popper, Typography } from '@mui/material';

import createBarcode from '@/app/actions/shipping/createBarcode';
import getUserPermittedAccounts from '@/app/actions/user/getUserPermittedAccounts';
import { CarrierAccountTypes } from '@/types/carrierAccount';
import { ShippingTypes } from '@/types/shipping';
import { Carrier } from '@/constants';
import getCarrierIcon from '@/lib/getCarrierIcon';

interface Props {
  shipping: ShippingTypes.IShipping;
  onSuccess: () => void;
}

const CreateBarcodeButton = ({ shipping, onSuccess }: Props) => {
  const router = useRouter();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [accounts, setAccounts] = useState<Partial<CarrierAccountTypes.ICarrierAccount>[]>([]);
  const [fetching, setFetching] = useState(true);

  const [selectedAccount, setSelectedAccount] = useState<Partial<CarrierAccountTypes.ICarrierAccount> | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      const res = await getUserPermittedAccounts();

      if (res.status === 'OK' && res.data) {
        setAccounts(res.data);
      } else {
        setError(res.message || 'Hesaplar yüklenemedi.');
      }

      setFetching(false);
    };

    fetchAccounts();
  }, []);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (account: Partial<CarrierAccountTypes.ICarrierAccount>) => {
    handleClose();
    setSelectedAccount(account);
    setModalOpen(true);
  };

  useEffect(() => {
    if (!modalOpen || !selectedAccount) return;

    let cancelled = false;

    const run = async () => {
      if (!selectedAccount.carrier || !selectedAccount.accountNumber) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await createBarcode({
          customInfo: selectedAccount.customInfo,
          hasCustomInfo: !!selectedAccount.hasCustomInfo,
          shippingId: shipping._id,
          firm: selectedAccount.carrier as Carrier,
          accountNumber: selectedAccount.accountNumber,
        });

        if (cancelled) return;

        if (res.status === 'OK') {
          onSuccess();
        } else {
          setError(res.message || 'Barkod oluşturulamadı');
        }
      } catch {
        setError('Sistem hatası oluştu');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [modalOpen, selectedAccount, shipping._id, router]);

  if (fetching) {
    return <CircularProgress size={20} />;
  }

  if (!accounts.length) {
    return null;
  }

  const open = Boolean(anchorEl);

  return (
    <>
      <ClickAwayListener onClickAway={handleClose}>
        <Box
          sx={{
            display: 'inline-flex',
            position: 'relative',
          }}
          onMouseEnter={event => {
            setAnchorEl(event.currentTarget);
          }}
          onMouseLeave={() => {
            setAnchorEl(null);
          }}
        >
          <Button size="small" variant="outlined">
            Barkod Oluştur
          </Button>

          <Popper open={open} anchorEl={anchorEl} placement="bottom-start" sx={{ zIndex: theme => theme.zIndex.tooltip }}>
            <Paper
              elevation={4}
              sx={{
                mt: 0.5,
                minWidth: 220,
                overflow: 'hidden',
              }}
              onMouseEnter={() => {
                if (anchorEl) {
                  setAnchorEl(anchorEl);
                }
              }}
            >
              {accounts.map(account => {
                const carrierName = account.carrier;

                const icon = carrierName ? getCarrierIcon(carrierName) : null;

                return (
                  <Box
                    key={account._id}
                    onClick={() => handleSelect(account)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      px: 2,
                      py: 1.25,
                      cursor: 'pointer',
                      transition: 'background-color 0.15s',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    {icon && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 28,
                          height: 28,
                          flexShrink: 0,
                        }}
                      >
                        {icon}
                      </Box>
                    )}

                    <Typography variant="body2">{account.name}</Typography>
                  </Box>
                );
              })}
            </Paper>
          </Popper>
        </Box>
      </ClickAwayListener>

      <Dialog
        open={modalOpen}
        onClose={() => {
          if (!loading) {
            setModalOpen(false);
          }
        }}
      >
        <DialogContent
          sx={{
            minWidth: 300,
            textAlign: 'center',
          }}
        >
          {loading && (
            <>
              <CircularProgress />

              <Typography sx={{ mt: 2 }}>Barkod oluşturuluyor...</Typography>
            </>
          )}

          {!loading && error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {!loading && !error && <Typography>Barkod başarıyla oluşturuldu</Typography>}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateBarcodeButton;
