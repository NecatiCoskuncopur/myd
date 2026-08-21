'use client';

import { useState } from 'react';

import { ShippingTypes } from '@/types/shipping';

const useShippingActions = () => {
  const [selectedRow, setSelectedRow] = useState<ShippingTypes.IShipping | null>(null);

  const [actionIconButton, setActionIconButton] = useState<HTMLElement | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [packageDialogOpen, setPackageDialogOpen] = useState(false);

  const [barcodeDialogOpen, setBarcodeDialogOpen] = useState(false);
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const [barcodeError, setBarcodeError] = useState<string | null>(null);

  const openActionsMenu = (row: ShippingTypes.IShipping, anchorEl: HTMLElement) => {
    setSelectedRow(row);
    setActionIconButton(anchorEl);
    setMenuOpen(true);
  };

  const closeActionsMenu = () => {
    setMenuOpen(false);

    setTimeout(() => {
      if (!deleteOpen) {
        setActionIconButton(null);
        setSelectedRow(null);
      }
    }, 200);
  };

  const openDeleteDialog = () => {
    setMenuOpen(false);
    setDeleteOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteOpen(false);
    setActionIconButton(null);
    setSelectedRow(null);
  };

  const openPackageDialog = () => {
    if (!selectedRow) return;

    setMenuOpen(false);
    setActionIconButton(null);
    setPackageDialogOpen(true);
  };

  const closePackageDialog = () => {
    setPackageDialogOpen(false);
  };

  const openBarcodeDialog = () => {
    setBarcodeDialogOpen(true);
  };

  const closeBarcodeDialog = () => {
    if (barcodeLoading) return;

    setBarcodeDialogOpen(false);
  };

  const startBarcodeLoading = () => {
    setBarcodeError(null);
    setBarcodeLoading(true);
    setBarcodeDialogOpen(true);
  };

  const finishBarcodeLoading = () => {
    setBarcodeLoading(false);
  };

  const setBarcodeFailure = (message: string) => {
    setBarcodeError(message);
  };

  const clearBarcodeError = () => {
    setBarcodeError(null);
  };

  return {
    selectedRow,
    actionIconButton,
    menuOpen,
    deleteOpen,
    packageDialogOpen,
    barcodeDialogOpen,
    barcodeLoading,
    barcodeError,
    openActionsMenu,
    closeActionsMenu,
    openDeleteDialog,
    closeDeleteDialog,
    openPackageDialog,
    closePackageDialog,
    openBarcodeDialog,
    closeBarcodeDialog,
    startBarcodeLoading,
    finishBarcodeLoading,
    setBarcodeFailure,
    clearBarcodeError,
  };
};

export default useShippingActions;
