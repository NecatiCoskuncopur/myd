'use client';

import React, { useState } from 'react';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { Button, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';

import getPaper from '@/app/actions/shipping/getPaper';
import { shippingMessages } from '@/constants';
import { useSnackbar } from '@/providers/SnackbarProvider';

interface PaperDownloadProps {
  shippingId: string;
}

const PaperDownload = ({ shippingId }: PaperDownloadProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);
  const { showSnackbar } = useSnackbar();
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDownload = async (type: 'labels' | 'invoices') => {
    handleClose();
    setLoading(true);

    try {
      const response = await getPaper({ shippingId, type });

      if (response.status !== 'OK' || !response.data?.file) {
        showSnackbar(response.message ?? shippingMessages.PAPER.ERROR, 'error');
        return;
      }

      const binary = atob(response.data.file);
      const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));

      const blob = new Blob([bytes], {
        type: 'application/pdf',
      });

      const url = URL.createObjectURL(blob);

      window.open(url, '_blank', 'noopener,noreferrer');

      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error(error);
      showSnackbar(shippingMessages.PAPER.ERROR, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="contained" size="small" startIcon={<FileDownloadOutlinedIcon />} onClick={handleClick} disabled={loading}>
        Evraklar
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={() => handleDownload('labels')}>
          <ListItemIcon>
            <DescriptionOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Barkod (Label)</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDownload('invoices')}>
          <ListItemIcon>
            <ReceiptLongOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Proforma Fatura</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default PaperDownload;
