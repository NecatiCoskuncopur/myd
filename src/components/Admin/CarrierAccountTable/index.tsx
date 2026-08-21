'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import AddIcon from '@mui/icons-material/Add';
import { GridColDef } from '@mui/x-data-grid';

import { GenericDataGrid, StyledButton, TableHeader, Wrapper } from '@/components';

import CarrierAccountActionsMenu from './CarrierAccountActionsMenu';
import columns from './columns';
import FilterSection from './FilterSection';
import CreateCarrierAccountForm from './Forms/CreateCarrierAccountForm';
import UpdateCarrierAccountForm from './Forms/UpdateCarrierAccountForm';
import useCarrierAccountActions from './hooks/useCarrierAccountActions';
import useCarrierAccountsList from './hooks/useCarrierAccountsList';

const CarrierAccountTable = () => {
  const searchParams = useSearchParams();

  const { data, rows, loading, page, limit, refetch } = useCarrierAccountsList(searchParams);

  const {
    selectedRow,
    menuAnchorEl,

    isCreateModalOpen,
    isEditModalOpen,

    openMenu,
    closeMenu,

    openCreateModal,
    openEditModal,
    closeModal,
  } = useCarrierAccountActions();

  const accountColumns: GridColDef[] = [
    ...columns,
    {
      field: 'actions',
      headerName: 'İşlemler',
      flex: 1,
      minWidth: 100,
      sortable: false,
      filterable: false,
      renderCell: params => (
        <CarrierAccountActionsMenu
          row={params.row}
          selectedRow={selectedRow}
          anchorEl={menuAnchorEl}
          onOpen={openMenu}
          onClose={closeMenu}
          onEdit={openEditModal}
        />
      ),
    },
  ];

  const handleFormSuccess = () => {
    closeModal();
    void refetch();
  };

  return (
    <Wrapper>
      <TableHeader title="Kargo Hesapları" subTitle="Entegre taşıyıcı firma hesaplarınızın listesi ve bağlantı detayları.">
        <StyledButton
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateModal}
          sx={{
            flexShrink: 0,
            whiteSpace: 'nowrap',
            alignSelf: {
              xs: 'stretch',
              sm: 'center',
            },
          }}
        >
          Yeni Hesap Oluştur
        </StyledButton>
      </TableHeader>

      <FilterSection searchParams={searchParams} />

      <GenericDataGrid
        rows={rows}
        columns={accountColumns}
        loading={loading}
        totalCount={data?.totalCount}
        page={page}
        limit={limit}
        searchParams={searchParams}
        noRowsMessage="Sistemde tanımlı kargo hesabı bulunamadı. Yeni bir taşıyıcı firma hesabı ekleyerek başlayabilirsiniz."
      />

      <CreateCarrierAccountForm open={isCreateModalOpen} onClose={closeModal} onSuccess={handleFormSuccess} />

      <UpdateCarrierAccountForm open={isEditModalOpen} account={selectedRow} onClose={closeModal} onSuccess={handleFormSuccess} />
    </Wrapper>
  );
};

export default CarrierAccountTable;
