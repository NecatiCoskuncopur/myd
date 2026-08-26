'use client';

import { useState } from 'react';

import { CarrierAccountTypes } from '@/types/carrierAccount';

type ModalType = 'edit' | 'create' | '';

const useCarrierAccountActions = () => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLButtonElement | null>(null);

  const [selectedRow, setSelectedRow] = useState<CarrierAccountTypes.ICarrierAccount | null>(null);

  const [modalState, setModalState] = useState<{
    type: ModalType;
    open: boolean;
  }>({
    type: '',
    open: false,
  });

  const openMenu = (row: CarrierAccountTypes.ICarrierAccount, anchorEl: HTMLButtonElement) => {
    setSelectedRow(row);
    setMenuAnchorEl(anchorEl);
  };

  const closeMenu = () => {
    setMenuAnchorEl(null);
    setSelectedRow(null);
  };

  const openCreateModal = () => {
    setSelectedRow(null);
    setMenuAnchorEl(null);

    setModalState({
      type: 'create',
      open: true,
    });
  };

  const openEditModal = () => {
    if (!selectedRow) {
      return;
    }

    setMenuAnchorEl(null);

    setModalState({
      type: 'edit',
      open: true,
    });
  };

  const closeModal = () => {
    setSelectedRow(null);
    setMenuAnchorEl(null);

    setModalState({
      type: '',
      open: false,
    });
  };

  const isCreateModalOpen = modalState.type === 'create' && modalState.open;

  const isEditModalOpen = modalState.type === 'edit' && modalState.open;

  return {
    selectedRow,
    menuAnchorEl,
    isCreateModalOpen,
    isEditModalOpen,
    openMenu,
    closeMenu,
    openCreateModal,
    openEditModal,
    closeModal,
  };
};

export default useCarrierAccountActions;
