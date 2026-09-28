'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Alert, Box } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';

import { GenericDataGrid, StyledButton, TableHeader, Wrapper } from '@/components';

import columns from './columns';
import DeleteSysParam from './DeleteSysParam';
import FilterSection from './FilterSection';
import CreateSysParamForm from './Forms/CreateSysParamForm';
import UpdateSysParamForm from './Forms/UpdateSysParamForm';
import useSysParamActions from './hooks/useSysParamActions';
import useSysParams from './hooks/useSysParams';
import SysParamActionsMenu from './SysParamActionsMenu';

const SysParamTable = () => {
  const searchParams = useSearchParams();

  const { data, rows, isLoading, page, limit, refetch } = useSysParams(searchParams);
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
  } = useSysParamActions();

  const sysParamsColumns: GridColDef[] = [
    ...columns,
    {
      field: 'actions',
      headerName: 'İşlemler',
      flex: 1,
      minWidth: 100,
      sortable: false,
      filterable: false,
      renderCell: params => (
        <SysParamActionsMenu
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
      <TableHeader title="Sistem Parametreleri" subTitle="Sistem genelinde kullanılan yapılandırma ve entegrasyon parametrelerini yönetin.">
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
            Yeni Parametre Oluştur
          </StyledButton>
        </Box>
      </TableHeader>

      <FilterSection searchParams={searchParams} open={isFilterOpen} onClose={() => setIsFilterOpen(false)} />

      <Alert
        severity="warning"
        variant="outlined"
        sx={{
          mb: 2,
          py: 0.25,
          alignItems: 'center',
        }}
      >
        Sistem parametrelerinin silinmesi, uygulamanın ilgili servis ve entegrasyonlarının çalışmasını etkileyebilir. Silme işlemi öncesinde geliştirici onayı
        alınması önerilir.
      </Alert>

      <GenericDataGrid
        rows={rows}
        columns={sysParamsColumns}
        loading={isLoading}
        totalCount={data?.totalCount ?? 0}
        page={page}
        limit={limit}
        searchParams={searchParams}
        noRowsMessage="Sistemde tanımlı parametre bulunamadı."
      />

      <CreateSysParamForm open={isCreateModalOpen} onClose={closeModal} onSuccess={handleSuccess} />
      <UpdateSysParamForm param={selectedRow} open={isEditModalOpen} onClose={closeModal} onSuccess={handleSuccess} />
      <DeleteSysParam param={selectedRow} anchorEl={actionIconButton} open={isDeleteModalOpen} onClose={closeModal} onSuccess={handleSuccess} />
    </Wrapper>
  );
};

export default SysParamTable;
