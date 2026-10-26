'use client';

import { useState } from 'react';

import { PricingListTypes } from '@/types/pricingList';

type ModalType = 'create' | 'edit' | 'delete' | 'duplicate' | '';

const usePriceListActions = () => {
  const [selectedRow, setSelectedRow] = useState<PricingListTypes.IPricingList | null>(null);
  const [actionIconButton, setActionIconButton] = useState<HTMLButtonElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalState, setModalState] = useState<{
    type: ModalType;
    open: boolean;
  }>({
    type: '',
    open: false,
  });

  const openMenu = (row: PricingListTypes.IPricingList, anchorEl: HTMLButtonElement) => {
    setSelectedRow(row);
    setActionIconButton(anchorEl);
    setMenuOpen(true);
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setActionIconButton(null);
    setSelectedRow(null);
  };

  const openCreateModal = () => {
    setSelectedRow(null);
    setActionIconButton(null);
    setMenuOpen(false);
    setModalState({ type: 'create', open: true });
  };

  const openEditModal = () => {
    if (!selectedRow) return;
    setMenuOpen(false);
    setModalState({ type: 'edit', open: true });
  };

  const openDeleteModal = () => {
    if (!selectedRow) return;
    setMenuOpen(false);
    setModalState({ type: 'delete', open: true });
  };

  const openDuplicateModal = () => {
    if (!selectedRow) return;
    setMenuOpen(false);
    setModalState({ type: 'duplicate', open: true });
  };

  const closeModal = () => {
    setSelectedRow(null);
    setActionIconButton(null);
    setMenuOpen(false);
    setModalState({ type: '', open: false });
  };

  const isCreateModalOpen = modalState.type === 'create' && modalState.open;
  const isEditModalOpen = modalState.type === 'edit' && modalState.open;
  const isDeleteModalOpen = modalState.type === 'delete' && modalState.open;
  const isDuplicateModalOpen = modalState.type === 'duplicate' && modalState.open;

  return {
    selectedRow,
    actionIconButton,
    menuOpen,

    isCreateModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    isDuplicateModalOpen,

    openMenu,
    closeMenu,

    openCreateModal,
    openEditModal,
    openDeleteModal,
    openDuplicateModal,
    closeModal,
  };
};

export default usePriceListActions;
