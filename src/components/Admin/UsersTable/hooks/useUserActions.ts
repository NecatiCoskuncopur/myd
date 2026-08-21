'use client';

import { useState } from 'react';

import { UserTypes } from '@/types/user';

type ModalType = 'edit' | 'balance' | '';

const useUserActions = () => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedRow, setSelectedRow] = useState<UserTypes.IUserWithPopulatedBalance | null>(null);
  const [modalState, setModalState] = useState<{
    type: ModalType;
    open: boolean;
  }>({
    type: '',
    open: false,
  });

  const openMenu = (row: UserTypes.IUserWithPopulatedBalance, anchorEl: HTMLElement) => {
    setSelectedRow(row);
    setMenuAnchorEl(anchorEl);
  };

  const closeMenu = () => {
    setMenuAnchorEl(null);
    setSelectedRow(null);
  };

  const openEditModal = () => {
    if (!selectedRow) return;

    setMenuAnchorEl(null);

    setModalState({
      type: 'edit',
      open: true,
    });
  };

  const openBalanceModal = () => {
    if (!selectedRow) return;

    setMenuAnchorEl(null);

    setModalState({
      type: 'balance',
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

  const isEditModalOpen = modalState.type === 'edit' && modalState.open;

  const isBalanceModalOpen = modalState.type === 'balance' && modalState.open;

  return {
    selectedRow,
    menuAnchorEl,
    isEditModalOpen,
    isBalanceModalOpen,
    openMenu,
    closeMenu,
    openEditModal,
    openBalanceModal,
    closeModal,
  };
};

export default useUserActions;
