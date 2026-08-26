'use client';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';

import { PricingListTypes } from '@/types/pricingList';

interface PriceListActionsMenuProps {
  row: PricingListTypes.IPricingList;
  selectedRow: PricingListTypes.IPricingList | null;
  anchorEl: HTMLButtonElement | null;
  menuOpen: boolean;
  onOpen: (row: PricingListTypes.IPricingList, anchorEl: HTMLButtonElement) => void;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const PriceListActionsMenu = ({ row, selectedRow, anchorEl, menuOpen, onOpen, onClose, onEdit, onDelete }: PriceListActionsMenuProps) => {
  const isOpen = menuOpen && anchorEl !== null && selectedRow?._id === row._id;

  return (
    <>
      <IconButton size="small" aria-label="Fiyat listesi işlemleri" onClick={event => onOpen(row, event.currentTarget)}>
        <MoreVertIcon />
      </IconButton>

      <Menu anchorEl={anchorEl} open={isOpen} onClose={onClose}>
        <MenuItem onClick={onEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>

          <ListItemText>Düzenle</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={onDelete}
          sx={{
            color: 'error.main',
          }}
        >
          <ListItemIcon>
            <DeleteIcon
              fontSize="small"
              sx={{
                color: 'error.main',
              }}
            />
          </ListItemIcon>

          <ListItemText>Sil</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default PriceListActionsMenu;
