'use client';

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';

import { UserTypes } from '@/types/user';

interface UserActionsMenuProps {
  row: UserTypes.IUserWithPopulatedBalance;
  selectedRow: UserTypes.IUserWithPopulatedBalance | null;
  anchorEl: HTMLElement | null;
  onOpen: (row: UserTypes.IUserWithPopulatedBalance, anchorEl: HTMLElement) => void;
  onClose: () => void;
  onEdit: () => void;
  onBalance: () => void;
}

const UserActionsMenu = ({ row, selectedRow, anchorEl, onOpen, onClose, onEdit, onBalance }: UserActionsMenuProps) => {
  const isOpen = anchorEl !== null && selectedRow?._id === row._id;

  return (
    <>
      <IconButton
        size="small"
        onClick={event => {
          onOpen(row, event.currentTarget);
        }}
      >
        <MoreVertIcon />
      </IconButton>

      <Menu anchorEl={anchorEl} open={isOpen} onClose={onClose}>
        <MenuItem onClick={onEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>

          <ListItemText>Düzenle</ListItemText>
        </MenuItem>

        <MenuItem onClick={onBalance}>
          <ListItemIcon>
            <AccountBalanceWalletIcon fontSize="small" />
          </ListItemIcon>

          <ListItemText>Bakiye Hareketi Ekle</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserActionsMenu;
