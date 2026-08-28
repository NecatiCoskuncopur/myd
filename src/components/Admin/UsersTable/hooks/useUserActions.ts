'use client';

import { useState } from 'react';

import { UserTypes } from '@/types/user';

type ModalType = 'edit' | 'addTransaction' | 'balanceTransactions' | '';

const useUserActions = () => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLButtonElement | null>(null);

  const [selectedRow, setSelectedRow] = useState<UserTypes.IUserWithPopulatedBalance | null>(null);

  const [modalState, setModalState] = useState<{
    type: ModalType;
    open: boolean;
  }>({
    type: '',
    open: false,
  });

  const openMenu = (row: UserTypes.IUserWithPopulatedBalance, anchorEl: HTMLButtonElement) => {
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

  const openAddTransactionModal = () => {
    if (!selectedRow) return;

    setMenuAnchorEl(null);

    setModalState({
      type: 'addTransaction',
      open: true,
    });
  };

  const openBalanceTransactionsModal = () => {
    if (!selectedRow) return;

    setMenuAnchorEl(null);

    setModalState({
      type: 'balanceTransactions',
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

  const isAddTransactionModalOpen = modalState.type === 'addTransaction' && modalState.open;

  const isBalanceTransactionsModalOpen = modalState.type === 'balanceTransactions' && modalState.open;

  return {
    selectedRow,
    menuAnchorEl,
    isEditModalOpen,
    isAddTransactionModalOpen,
    isBalanceTransactionsModalOpen,
    openMenu,
    closeMenu,
    openEditModal,
    openAddTransactionModal,
    openBalanceTransactionsModal,
    closeModal,
  };
};

export default useUserActions;
