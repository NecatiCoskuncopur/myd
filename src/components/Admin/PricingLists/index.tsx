'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Box } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';

import { GenericDataGrid, StyledButton, TableHeader, Wrapper } from '@/components';

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

  const { data, rows, isLoading, page, limit, refetch } = usePriceLists(searchParams);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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

  const priceListsColumns: GridColDef[] = [
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
  ];

  const handleSuccess = () => {
    void refetch();
  };

  return (
    <Wrapper>
      <TableHeader title="Fiyat Listeleri" subTitle="Müşteri fiyatlandırmalarında kullanılacak fiyat listelerini yönetin.">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            width: { xs: '100%', sm: 'auto' },
            gap: 1,
            flexShrink: 0,
          }}
        >
          <StyledButton type="button" variant="outlined" startIcon={<FilterListIcon />} onClick={() => setIsFilterOpen(true)} sx={{ whiteSpace: 'nowrap' }}>
            Filtrele
          </StyledButton>

          <StyledButton type="button" variant="contained" startIcon={<AddIcon />} onClick={openCreateModal} sx={{ whiteSpace: 'nowrap' }}>
            Yeni Liste Oluştur
          </StyledButton>
        </Box>
      </TableHeader>

      <FilterSection searchParams={searchParams} open={isFilterOpen} onClose={() => setIsFilterOpen(false)} />

      <GenericDataGrid
        rows={rows}
        columns={priceListsColumns}
        loading={isLoading}
        totalCount={data?.totalCount ?? 0}
        page={page}
        limit={limit}
        searchParams={searchParams}
        noRowsMessage="Sistemde tanımlı fiyat listesi bulunamadı."
      />

      <CreateList open={isCreateModalOpen} onClose={closeModal} onSuccess={handleSuccess} />
      <UpdateList list={selectedRow} open={isEditModalOpen} onClose={closeModal} onSuccess={handleSuccess} />
      <DeleteList list={selectedRow} anchorEl={actionIconButton} open={isDeleteModalOpen} onClose={closeModal} onSuccess={handleSuccess} />
    </Wrapper>
  );
};

export default PriceLists;
