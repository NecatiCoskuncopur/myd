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

type PaperType = 'labels' | 'invoices';

type ShippingActionsMenuProps = {
  anchorEl: HTMLElement | null;
  open: boolean;
  selectedRow: ShippingTypes.IShipping | null;
  accounts: CarrierAccountTypes.IUserPermittedAccount[];
  pricingLists: Record<string, PricingListTypes.IPricingList>;
  canCreateBarcode: boolean;
  onClose: () => void;
  onDelete: () => void;
  onCreateBarcode: (account: CarrierAccountTypes.IUserPermittedAccount) => Promise<void>;
  onDownloadPaper: (type: PaperType) => Promise<void>;
};

const isPaperAvailable = (labeledAt?: Date) => {
  if (!labeledAt) {
    return false;
  }

  const expiresAt = new Date(labeledAt);
  expiresAt.setMonth(expiresAt.getMonth() + 3);

  return expiresAt.getTime() > Date.now();
};

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

  const shippingId = selectedRow?._id;
  const hasTrackingNumber = Boolean(selectedRow?.carrier?.trackingNumber);
  const canCreateShippingBarcode = !hasTrackingNumber && canCreateBarcode;
  const canDownloadPaper = hasTrackingNumber && isPaperAvailable(selectedRow?.labeledAt);
  const handleNavigate = (path: string) => {
    onClose();
    router.push(path);
  };

  const handleView = () => {
    if (!shippingId) {
      return;
    }

    handleNavigate(`/panel/gonderilerim/${shippingId}`);
  };

  const handleEdit = () => {
    if (!shippingId) {
      return;
    }

    handleNavigate(`/panel/gonderilerim/${shippingId}/duzenle`);
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

          <MenuItem onClick={onDelete}>
            <ListItemIcon>
              <DeleteOutlined fontSize="small" color="error" />
            </ListItemIcon>

            <ListItemText sx={{ color: 'error.main' }}>Sil</ListItemText>
          </MenuItem>
        </>
      )}

      {canCreateShippingBarcode && (
        <>
          <Divider />

          {accounts.length === 0 ? (
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
                <MenuItem
                  key={account._id.toString()}
                  onClick={() => {
                    void onCreateBarcode(account);
                  }}
                >
                  <ListItemText primary={account.displayName} secondary={`Ödenecek Tutar: ${customerPrice ?? '-'} $`} />
                </MenuItem>
              );
            })
          )}
        </>
      )}

      {canDownloadPaper && (
        <>
          <Divider />

          <MenuItem
            onClick={() => {
              void onDownloadPaper('labels');
            }}
          >
            <ListItemIcon>
              <DescriptionOutlinedIcon fontSize="small" />
            </ListItemIcon>

            <ListItemText>Barkod İndir (Label)</ListItemText>
          </MenuItem>

          <MenuItem
            onClick={() => {
              void onDownloadPaper('invoices');
            }}
          >
            <ListItemIcon>
              <ReceiptLongOutlinedIcon fontSize="small" />
            </ListItemIcon>

            <ListItemText>Proforma Fatura İndir</ListItemText>
          </MenuItem>
        </>
      )}
    </Menu>
  );
};

export default ShippingActionsMenu;
