'use client';

import React, { useState } from 'react';
import { Button, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import getPaper from '@/app/actions/shipping/getPaper';

interface PaperDownloadProps {
  shippingId: string;
}

const PaperDownload = ({ shippingId }: PaperDownloadProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDownload = async (type: 'labels' | 'invoices') => {
    handleClose();
    try {
      const res = await getPaper({ shippingId, type });

      if (res.status === 'OK' && res.data?.file) {
        const pdfUrl = `data:application/pdf;base64,${res.data.file}`;
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(`<iframe src="${pdfUrl}" width="100%" height="100%" style="border:none; margin:0; padding:0; overflow:hidden;"></iframe>`);
          newWindow.document.title = type === 'labels' ? 'Kargo Barkodu' : 'Proforma Fatura';
        }
      } else {
        alert(res.message || 'Evrak indirilirken bir hata oluştu.');
      }
    } catch (error) {
      console.error(error);
      alert('Beklenmedik bir hata oluştu.');
    }
  };

  return (
    <>
      <Button variant="contained" size="small" startIcon={<FileDownloadOutlinedIcon />} onClick={handleClick}>
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
