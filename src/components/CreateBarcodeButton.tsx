'use client';

import { useEffect, useState } from 'react';

import { Alert, Box, Button, CircularProgress, ClickAwayListener, Dialog, DialogContent, Paper, Popper, Typography } from '@mui/material';

import createBarcode from '@/app/actions/shipping/createBarcode';
import getUserPermittedAccounts from '@/app/actions/user/getUserPermittedAccounts';
import getUserPricingLists from '@/app/actions/user/getUserPricingList';
import { CarrierAccountTypes } from '@/types/carrierAccount';
import { ShippingTypes } from '@/types/shipping';
import { PricingListTypes } from '@/types/pricingList';
import { Carrier } from '@/constants';
import { getCustomerPrice } from '@/lib/getCustomerPrice';

interface Props {
  shipping: ShippingTypes.IShipping;
  onSuccess: () => void;
}

const CreateBarcodeButton = ({ shipping, onSuccess }: Props) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [accounts, setAccounts] = useState<Partial<CarrierAccountTypes.ICarrierAccount>[]>([]);
  const [pricingLists, setPricingLists] = useState<Record<string, PricingListTypes.IPricingList>>({});
  const [fetching, setFetching] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<Partial<CarrierAccountTypes.ICarrierAccount> | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);

      try {
        const [accountsRes, pricingListsRes] = await Promise.all([getUserPermittedAccounts(), getUserPricingLists()]);

        if (accountsRes.status === 'OK' && accountsRes.data) {
          setAccounts(accountsRes.data);
        } else {
          setError(accountsRes.message || 'Hesaplar yüklenemedi.');
        }

        if (pricingListsRes.status === 'OK' && pricingListsRes.data) {
          setPricingLists(pricingListsRes.data);
        } else {
          setPricingLists({});
        }
      } catch {
        setError('Veriler yüklenemedi.');
      } finally {
        setFetching(false);
      }
    };

    fetchData();
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
          displayName: selectedAccount.displayName!,
          shippingId: shipping._id,
          firm: selectedAccount.carrier as Carrier,
          accountNumber: selectedAccount.accountNumber,
          carrierAccountId: selectedAccount._id!.toString(),
        });

        if (cancelled) return;

        if (res.status === 'OK') {
          onSuccess();
        } else {
          setError(res.message || 'Barkod oluşturulamadı');
        }
      } catch {
        if (!cancelled) {
          setError('Sistem hatası oluştu');
        }
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
  }, [modalOpen, selectedAccount, shipping._id, onSuccess]);

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

          <Popper
            open={open}
            anchorEl={anchorEl}
            placement="bottom-start"
            sx={{
              zIndex: theme => theme.zIndex.tooltip,
            }}
          >
            <Paper
              elevation={4}
              sx={{
                mt: 0.5,
                minWidth: 280,
                overflow: 'hidden',
              }}
              onMouseEnter={() => {
                if (anchorEl) {
                  setAnchorEl(anchorEl);
                }
              }}
            >
              {accounts.map(account => {
                const customerPrice = getCustomerPrice({
                  countryCode: shipping?.consignee?.address.country ?? '',
                  weight: shipping?.package.weight ?? 0,
                  pricingList: account.accountType ? pricingLists[account.accountType] : null,
                });
                return (
                  <Box
                    key={account._id}
                    onClick={() => handleSelect(account)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                      px: 2,
                      py: 1.25,
                      cursor: 'pointer',
                      transition: 'background-color 0.15s',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <Typography variant="body2">{account.displayName}</Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Ödenecek Tutar: <strong>{customerPrice ?? '-'} $</strong>
                    </Typography>
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
