'use client';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';

interface SysParamActionsMenuProps {
  row: SysParamTypes.ISysParam;
  selectedRow: SysParamTypes.ISysParam | null;
  anchorEl: HTMLButtonElement | null;
  menuOpen: boolean;
  onOpen: (row: SysParamTypes.ISysParam, anchorEl: HTMLButtonElement) => void;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const SysParamActionsMenu = ({ row, selectedRow, anchorEl, menuOpen, onOpen, onClose, onEdit, onDelete }: SysParamActionsMenuProps) => {
  const isOpen = menuOpen && anchorEl !== null && selectedRow?._id === row._id;

  return (
    <>
      <IconButton size="small" aria-label="Sistem parametresi işlemleri" onClick={event => onOpen(row, event.currentTarget)}>
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

export default SysParamActionsMenu;
