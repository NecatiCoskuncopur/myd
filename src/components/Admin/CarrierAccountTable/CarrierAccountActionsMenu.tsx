'use client';

import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';

import { CarrierAccountTypes } from '@/types/carrierAccount';

interface CarrierAccountActionsMenuProps {
  row: CarrierAccountTypes.ICarrierAccount;
  selectedRow: CarrierAccountTypes.ICarrierAccount | null;
  anchorEl: HTMLButtonElement | null;
  onOpen: (row: CarrierAccountTypes.ICarrierAccount, anchorEl: HTMLButtonElement) => void;
  onClose: () => void;
  onEdit: () => void;
}

const CarrierAccountActionsMenu = ({ row, selectedRow, anchorEl, onOpen, onClose, onEdit }: CarrierAccountActionsMenuProps) => {
  const isOpen = anchorEl !== null && selectedRow?._id === row._id;

  return (
    <>
      <IconButton size="small" aria-label="Kargo hesabı işlemleri" onClick={event => onOpen(row, event.currentTarget)}>
        <MoreVertIcon />
      </IconButton>

      <Menu anchorEl={anchorEl} open={isOpen} onClose={onClose}>
        <MenuItem onClick={onEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>

          <ListItemText>Düzenle</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default CarrierAccountActionsMenu;
