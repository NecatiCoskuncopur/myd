'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Alert, Button, CircularProgress, Dialog, DialogContent, Menu, MenuItem, Typography } from '@mui/material';

import createBarcode from '@/app/actions/shipping/createBarcode';
import getUserPermittedAccounts from '@/app/actions/user/getUserPermittedAccounts';

interface Props {
  shipping: ShippingTypes.IShipping;
}

const CreateBarcodeButton = ({ shipping }: Props) => {
  const router = useRouter();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
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

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSelect = (acc: Partial<CarrierAccountTypes.ICarrierAccount>) => {
    handleCloseMenu();
    setSelectedAccount(acc);
    setModalOpen(true);
  };

  // modal açılınca işlem başlat
  useEffect(() => {
    if (!modalOpen || !selectedAccount) return;

    const run = async () => {
      if (!selectedAccount.carrier || !selectedAccount.accountNumber) return;

      setLoading(true);
      setError(null);

      try {
        const res = await createBarcode({
          shippingId: shipping._id,
          firm: selectedAccount.carrier as 'UPS' | 'FEDEX',
          accountNumber: selectedAccount.accountNumber,
        });

        if (res.status === 'OK') {
          router.refresh();
        } else {
          setError(res.message || 'Barkod oluşturulamadı');
        }
      } catch {
        setError('Sistem hatası oluştu');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [modalOpen, selectedAccount]);

  if (fetching) return <CircularProgress size={20} />;
  if (!accounts.length) return null;

  return (
    <>
      <Button size="small" variant="outlined" onClick={handleOpen}>
        Barkod Oluştur
      </Button>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        {accounts.map(acc => (
          <MenuItem key={acc._id} onClick={() => handleSelect(acc)}>
            {acc.name}
          </MenuItem>
        ))}
      </Menu>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogContent sx={{ minWidth: 300, textAlign: 'center' }}>
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
