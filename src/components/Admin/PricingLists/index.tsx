'use client';

import { useSearchParams } from 'next/navigation';
import AddIcon from '@mui/icons-material/Add';
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
        <StyledButton
          type="button"
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
