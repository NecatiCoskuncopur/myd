'use client';

import { useState } from 'react';

import { CarrierAccountTypes } from '@/types/carrierAccount';

type ModalType = 'edit' | 'create' | '';

const useCarrierAccountActions = () => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedRow, setSelectedRow] = useState<CarrierAccountTypes.ICarrierAccount | null>(null);
  const [modalState, setModalState] = useState<{
    type: ModalType;
    open: boolean;
  }>({
    type: '',
    open: false,
  });

  const openMenu = (row: CarrierAccountTypes.ICarrierAccount, anchorEl: HTMLElement) => {
    setSelectedRow(row);
    setMenuAnchorEl(anchorEl);
  };

  const closeMenu = () => {
    setMenuAnchorEl(null);
    setSelectedRow(null);
  };

  const openCreateModal = () => {
    setSelectedRow(null);

    setModalState({
      type: 'create',
      open: true,
    });

    setMenuAnchorEl(null);
  };

  const openEditModal = () => {
    if (!selectedRow) return;

    setModalState({
      type: 'edit',
      open: true,
    });

    setMenuAnchorEl(null);
  };

  const closeModal = () => {
    setSelectedRow(null);

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
    modalState,
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
