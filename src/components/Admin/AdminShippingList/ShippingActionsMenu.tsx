'use client';

import { useRouter } from 'next/navigation';
import { DeleteOutlined } from '@mui/icons-material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import EditIcon from '@mui/icons-material/Edit';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { Divider, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';

import getCarrierIcon from '@/lib/getCarrierIcon';
import { getCarrierPrice } from '@/lib/getCarrierPrice';
import { getCustomerPrice } from '@/lib/getCustomerPrice';
import { CarrierAccountTypes } from '@/types/carrierAccount';
import { PricingListTypes } from '@/types/pricingList';
import { ShippingTypes } from '@/types/shipping';

interface ShippingActionsMenuProps {
  anchorEl: HTMLButtonElement | null;
  open: boolean;

  selectedRow: ShippingTypes.IShipping | null;

  accounts: CarrierAccountTypes.IUserPermittedAccount[];

  pricingLists: Record<string, PricingListTypes.IPricingList>;

  canCreateBarcode: boolean;

  onClose: () => void;
  onOpenDelete: () => void;
  onOpenPackage: () => void;

  onCreateBarcode: (account: CarrierAccountTypes.IUserPermittedAccount) => void;

  onDownloadPaper: (type: 'labels' | 'invoices') => void;
}

const ShippingActionsMenu = ({
  anchorEl,
  open,
  selectedRow,
  accounts,
  pricingLists,
  canCreateBarcode,
  onClose,
  onOpenDelete,
  onOpenPackage,
  onCreateBarcode,
  onDownloadPaper,
}: ShippingActionsMenuProps) => {
  const router = useRouter();

  const hasTrackingNumber = Boolean(selectedRow?.carrier?.trackingNumber);

  const hasLabel = (() => {
    if (!selectedRow?.labeledAt) {
      return false;
    }

    const expiryDate = new Date(selectedRow.labeledAt);

    expiryDate.setMonth(expiryDate.getMonth() + 3);

    return expiryDate.getTime() > Date.now();
  })();

  const showBarcodeItem = !hasTrackingNumber && canCreateBarcode;

  const handleEdit = () => {
    const id = selectedRow?._id;

    if (!id) {
      return;
    }

    onClose();

    router.push(`/panel/gonderilerim/${id}/duzenle`);
  };

  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
      <MenuItem onClick={onOpenPackage}>
        <ListItemIcon>
          <Inventory2OutlinedIcon fontSize="small" />
        </ListItemIcon>

        <ListItemText>Paket Bilgilerini Güncelle</ListItemText>
      </MenuItem>

      {!hasTrackingNumber && (
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>

          <ListItemText>Düzenle</ListItemText>
        </MenuItem>
      )}

      {!hasTrackingNumber && (
        <MenuItem onClick={onOpenDelete}>
          <ListItemIcon>
            <DeleteOutlined fontSize="small" color="error" />
          </ListItemIcon>

          <ListItemText
            sx={{
              color: 'error.main',
            }}
          >
            Sil
          </ListItemText>
        </MenuItem>
      )}

      {showBarcodeItem && <Divider />}

      {showBarcodeItem &&
        (accounts.length === 0 ? (
          <MenuItem disabled>
            <ListItemIcon>
              <QrCode2OutlinedIcon fontSize="small" />
            </ListItemIcon>

            <ListItemText>Barkod Hesabı Bulunamadı</ListItemText>
          </MenuItem>
        ) : (
          accounts.map(account => {
            const icon = getCarrierIcon(account.carrier);

            const cost = getCarrierPrice({
              countryCode: selectedRow?.consignee?.address.country ?? '',
              weight: selectedRow?.package.weight ?? 0,
              pricing: account.pricing,
            });

            const customerPrice = getCustomerPrice({
              countryCode: selectedRow?.consignee?.address.country ?? '',
              weight: selectedRow?.package.weight ?? 0,
              pricingList: pricingLists[account.accountType] ?? null,
            });

            return (
              <MenuItem key={account._id} onClick={() => onCreateBarcode(account)}>
                <ListItemIcon
                  sx={{
                    minWidth: 32,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {icon}
                </ListItemIcon>

                <ListItemText primary={account.name} secondary={`Maliyet: ${cost ?? '-'} $ | Müşteri Fiyatı: ${customerPrice ?? '-'} $`} />
              </MenuItem>
            );
          })
        ))}

      {hasTrackingNumber && hasLabel && <Divider />}

      {hasTrackingNumber && hasLabel && (
        <MenuItem onClick={() => onDownloadPaper('labels')}>
          <ListItemIcon>
            <DescriptionOutlinedIcon fontSize="small" />
          </ListItemIcon>

          <ListItemText>Barkod İndir (Label)</ListItemText>
        </MenuItem>
      )}

      {hasTrackingNumber && hasLabel && (
        <MenuItem onClick={() => onDownloadPaper('invoices')}>
          <ListItemIcon>
            <ReceiptLongOutlinedIcon fontSize="small" />
          </ListItemIcon>

          <ListItemText>Proforma Fatura İndir</ListItemText>
        </MenuItem>
      )}
    </Menu>
  );
};

export default ShippingActionsMenu;
