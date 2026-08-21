'use client';

import React, { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import AddIcon from '@mui/icons-material/Add';
import { GridColDef } from '@mui/x-data-grid';

import { GenericDataGrid, StyledButton, TableHeader, Wrapper } from '@/components';
import { useSnackbar } from '@/providers/SnackbarProvider';

import columns from './columns';
import DeleteList from './DeleteList';
import FilterSection from './FilterSection';
import CreateList from './Forms/CreateList';
import UpdateList from './Forms/UpdateList';
import usePriceListActions from './hooks/usePriceListActions';
import usePriceLists from './hooks/usePriceLists';
import PriceListActionsMenu from './PriceListActionsMenu';

const PriceLists = () => {
  const searchParams = useSearchParams();
  const { showSnackbar } = useSnackbar();

  const { data, rows, loading, page, limit, refetch } = usePriceLists(searchParams);

  const {
    selectedRow,
    actionIconButton,
    menuOpen,

    isCreateModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,

    openMenu,
    closeMenu,

    openCreateModal,
    openEditModal,
    openDeleteModal,
    closeModal,
  } = usePriceListActions();

  const priceListsColumns = useMemo<GridColDef[]>(
    () => [
      ...columns,
      {
        field: 'actions',
        headerName: 'İşlemler',
        flex: 1,
        minWidth: 100,
        sortable: false,
        filterable: false,

        renderCell: params => (
          <PriceListActionsMenu
            row={params.row}
            selectedRow={selectedRow}
            anchorEl={actionIconButton}
            menuOpen={menuOpen}
            onOpen={openMenu}
            onClose={closeMenu}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
          />
        ),
      },
    ],
    [selectedRow, actionIconButton, menuOpen, openMenu, closeMenu, openEditModal, openDeleteModal],
  );

  const handleFormSuccess = () => {
    closeModal();
    void refetch();
  };

  return (
    <Wrapper>
      <TableHeader title="Fiyat Listeleri" subTitle="Müşteri fiyatlandırmalarında kullanılacak fiyat listelerini yönetin.">
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
          Yeni Liste Oluştur
        </StyledButton>
      </TableHeader>

      <FilterSection searchParams={searchParams} />

      <GenericDataGrid
        rows={rows}
        columns={priceListsColumns}
        loading={loading}
        totalCount={data?.totalCount}
        page={page}
        limit={limit}
        searchParams={searchParams}
        noRowsMessage="Sistemde tanımlı fiyat listesi bulunamadı."
      />

      <CreateList open={isCreateModalOpen} onClose={closeModal} onSuccess={handleFormSuccess} />

      <UpdateList list={selectedRow} open={isEditModalOpen} onClose={closeModal} onSuccess={handleFormSuccess} />

      <DeleteList
        list={selectedRow}
        anchorEl={actionIconButton}
        open={isDeleteModalOpen}
        onClose={closeModal}
        onSuccess={message => {
          closeModal();
          showSnackbar(message, 'success');
          void refetch();
        }}
      />
    </Wrapper>
  );
};

export default PriceLists;
