'use client';

import { useState } from 'react';

import { ShippingTypes } from '@/types/shipping';

const useShippingActions = () => {
  const [selectedRow, setSelectedRow] = useState<ShippingTypes.IShipping | null>(null);

  const [actionIconButton, setActionIconButton] = useState<HTMLButtonElement | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const [packageDialogOpen, setPackageDialogOpen] = useState(false);

  const [barcodeDialogOpen, setBarcodeDialogOpen] = useState(false);

  const [barcodeLoading, setBarcodeLoading] = useState(false);

  const [barcodeError, setBarcodeError] = useState<string | null>(null);

  const clearSelection = () => {
    setSelectedRow(null);
    setActionIconButton(null);
  };

  const openActionsMenu = (row: ShippingTypes.IShipping, anchorEl: HTMLButtonElement) => {
    setSelectedRow(row);
    setActionIconButton(anchorEl);
    setMenuOpen(true);
  };

  const closeActionsMenu = () => {
    setMenuOpen(false);
    clearSelection();
  };

  const openDeleteDialog = () => {
    if (!selectedRow) {
      return;
    }

    setMenuOpen(false);
    setDeleteOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteOpen(false);
    clearSelection();
  };

  const openPackageDialog = () => {
    if (!selectedRow) {
      return;
    }

    setMenuOpen(false);
    setActionIconButton(null);
    setPackageDialogOpen(true);
  };

  const closePackageDialog = () => {
    setPackageDialogOpen(false);
    clearSelection();
  };

  const closeBarcodeDialog = () => {
    if (barcodeLoading) {
      return;
    }

    setBarcodeDialogOpen(false);
    setBarcodeError(null);
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
    closeBarcodeDialog,
    startBarcodeLoading,
    finishBarcodeLoading,
    setBarcodeFailure,
  };
};

export default useShippingActions;
