'use client';

import { useSearchParams } from 'next/navigation';
import AddIcon from '@mui/icons-material/Add';
import CalculateIcon from '@mui/icons-material/Calculate';
import { Box } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';

import { GenericDataGrid, StyledButton, TableHeader, Wrapper } from '@/components';

import CalculateCarrierAccountCostModal from './CalcuateCarrierAccountCostModal';
import CarrierAccountActionsMenu from './CarrierAccountActionsMenu';
import columns from './columns';
import FilterSection from './FilterSection';
import CreateCarrierAccountForm from './Forms/CreateCarrierAccountForm';
import UpdateCarrierAccountForm from './Forms/UpdateCarrierAccountForm';
import useCarrierAccountActions from './hooks/useCarrierAccountActions';
import useCarrierAccountsList from './hooks/useCarrierAccountsList';

const CarrierAccountTable = () => {
  const searchParams = useSearchParams();

  const { data, rows, isLoading, page, limit, refetch } = useCarrierAccountsList(searchParams);

  const {
    selectedRow,
    menuAnchorEl,
    isCreateModalOpen,
    isEditModalOpen,
    isCalculateModalOpen,
    openMenu,
    closeMenu,
    openCreateModal,
    openEditModal,
    openCalculateModal,
    closeCalculateModal,
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
    void refetch();
  };

  return (
    <Wrapper>
      <TableHeader title="Kargo Hesapları" subTitle="Entegre taşıyıcı firma hesaplarınızın listesi ve bağlantı detayları.">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexShrink: 0,
          }}
        >
          <StyledButton
            type="button"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreateModal}
            sx={{
              whiteSpace: 'nowrap',
            }}
          >
            Yeni Hesap Oluştur
          </StyledButton>

          <StyledButton
            type="button"
            variant="contained"
            startIcon={<CalculateIcon />}
            onClick={openCalculateModal}
            sx={{
              whiteSpace: 'nowrap',
            }}
          >
            Hesapla
          </StyledButton>
        </Box>
      </TableHeader>

      <FilterSection searchParams={searchParams} />

      <GenericDataGrid
        rows={rows}
        columns={accountColumns}
        loading={isLoading}
        totalCount={data?.totalCount ?? 0}
        page={page}
        limit={limit}
        searchParams={searchParams}
        noRowsMessage="Sistemde tanımlı kargo hesabı bulunamadı. Yeni bir taşıyıcı firma hesabı ekleyerek başlayabilirsiniz."
      />

      <CreateCarrierAccountForm open={isCreateModalOpen} onClose={closeModal} onSuccess={handleFormSuccess} />

      <UpdateCarrierAccountForm open={isEditModalOpen} account={selectedRow} onClose={closeModal} onSuccess={handleFormSuccess} />

      <CalculateCarrierAccountCostModal open={isCalculateModalOpen} onClose={closeCalculateModal} />
    </Wrapper>
  );
};

export default CarrierAccountTable;
