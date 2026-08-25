'use client';

import { useState } from 'react';

import { ShippingTypes } from '@/types/shipping';

const useShippingActions = () => {
  const [selectedRow, setSelectedRow] = useState<ShippingTypes.IShipping | null>(null);

  const [actionIconButton, setActionIconButton] = useState<HTMLElement | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [barcodeDialogOpen, setBarcodeDialogOpen] = useState(false);
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const [barcodeError, setBarcodeError] = useState<string | null>(null);

  const clearSelection = () => {
    setSelectedRow(null);
    setActionIconButton(null);
  };

  const openActionsMenu = (row: ShippingTypes.IShipping, anchorEl: HTMLElement) => {
    setSelectedRow(row);
    setActionIconButton(anchorEl);
    setMenuOpen(true);
  };

  const closeActionsMenu = () => {
    setMenuOpen(false);
    clearSelection();
  };

  const openDeleteDialog = () => {
    setMenuOpen(false);
    setDeleteOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteOpen(false);
    clearSelection();
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

  const closeBarcodeDialog = () => {
    if (barcodeLoading) {
      return;
    }

    setBarcodeDialogOpen(false);
    setBarcodeError(null);
  };

  return {
    selectedRow,
    actionIconButton,
    menuOpen,
    deleteOpen,
    barcodeDialogOpen,
    barcodeLoading,
    barcodeError,
    openActionsMenu,
    closeActionsMenu,
    openDeleteDialog,
    closeDeleteDialog,
    closeBarcodeDialog,
    startBarcodeLoading,
    finishBarcodeLoading,
    setBarcodeFailure,
  };
};

export default useShippingActions;
