'use client';

import { useRouter } from 'next/navigation';

import { DeleteOutlined } from '@mui/icons-material';

import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import EditIcon from '@mui/icons-material/Edit';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { Divider, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { getCustomerPrice } from '@/lib/getCustomerPrice';
import { CarrierAccountTypes } from '@/types/carrierAccount';
import { PricingListTypes } from '@/types/pricingList';
import { ShippingTypes } from '@/types/shipping';

interface ShippingActionsMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  selectedRow: ShippingTypes.IShipping | null;
  accounts: Partial<CarrierAccountTypes.ICarrierAccount>[];
  pricingLists: Record<string, PricingListTypes.IPricingList>;
  canCreateBarcode: boolean;
  onClose: () => void;
  onDelete: () => void;
  onCreateBarcode: (account: Partial<CarrierAccountTypes.ICarrierAccount>) => void;
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
  onDelete,
  onCreateBarcode,
  onDownloadPaper,
}: ShippingActionsMenuProps) => {
  const router = useRouter();

  const hasTrackingNumber = !!selectedRow?.carrier?.trackingNumber;

  const hasLabel = selectedRow?.labeledAt ? new Date(selectedRow.labeledAt).setMonth(new Date(selectedRow.labeledAt).getMonth() + 3) > Date.now() : false;

  const showBarcodeItem = !hasTrackingNumber && canCreateBarcode;

  const handleView = () => {
    const id = selectedRow?._id;

    if (!id) return;

    onClose();

    router.push(`/panel/gonderilerim/${id}`);
  };

  const handleEdit = () => {
    const id = selectedRow?._id;

    if (!id) return;

    onClose();

    router.push(`/panel/gonderilerim/${id}/duzenle`);
  };

  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
      <MenuItem onClick={handleView}>
        <ListItemIcon>
          <VisibilityOutlinedIcon fontSize="small" />
        </ListItemIcon>

        <ListItemText>İncele</ListItemText>
      </MenuItem>

      {!hasTrackingNumber && (
        <>
          <Divider />

          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>

            <ListItemText>Düzenle</ListItemText>
          </MenuItem>
        </>
      )}

      {!hasTrackingNumber && (
        <MenuItem onClick={onDelete}>
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
            const customerPrice = getCustomerPrice({
              countryCode: selectedRow?.consignee?.address.country ?? '',

              weight: selectedRow?.package.weight ?? 0,

              pricingList: account.accountType ? pricingLists[account.accountType] : null,
            });

            return (
              <MenuItem key={account._id?.toString()} onClick={() => onCreateBarcode(account)}>
                <ListItemText primary={account.displayName} secondary={`Ödenecek Tutar: ${customerPrice ?? '-'} $`} />
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
