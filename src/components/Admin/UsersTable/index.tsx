'use client';

import { useSearchParams } from 'next/navigation';
import type { GridColDef } from '@mui/x-data-grid';

import { GenericDataGrid, TableHeader, Wrapper } from '@/components';

import AddTransaction from './AddTransaction';
import BalanceTransactions from './BalanceTransactions';
import columns from './columns';
import EditUser from './EditUser';
import FilterSection from './FilterSection';
import useUserActions from './hooks/useUserActions';
import useUsersList from './hooks/useUsersList';
import UserActionsMenu from './UserActionsMenu';

const Users = () => {
  const searchParams = useSearchParams();

  const { data, rows, isLoading, page, limit, refetch } = useUsersList(searchParams);

  const {
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
  } = useUserActions();

  const usersColumns: GridColDef[] = [
    ...columns,
    {
      field: 'actions',
      headerName: 'İşlemler',
      flex: 1,
      minWidth: 100,
      sortable: false,
      filterable: false,
      renderCell: params => (
        <UserActionsMenu
          row={params.row.originalUser}
          selectedRow={selectedRow}
          anchorEl={menuAnchorEl}
          onOpen={openMenu}
          onClose={closeMenu}
          onEdit={openEditModal}
          onAddBalanceTransaction={openAddTransactionModal}
          onViewBalanceTransactions={openBalanceTransactionsModal}
        />
      ),
    },
  ];

  const handleSuccess = () => {
    closeModal();
    void refetch();
  };

  return (
    <Wrapper>
      <TableHeader title="Üyeler" subTitle="Kullanıcı hesapları, erişim izinleri ve üyelik hareketleri özeti." stacked>
        <FilterSection searchParams={searchParams} />
      </TableHeader>

      <GenericDataGrid
        rows={rows}
        columns={usersColumns}
        loading={isLoading}
        totalCount={data?.totalCount ?? 0}
        page={page}
        limit={limit}
        searchParams={searchParams}
        noRowsMessage="Henüz kayıtlı bir üye bulunmuyor."
      />

      <BalanceTransactions
        userId={selectedRow?._id ?? ''}
        userName={`${selectedRow?.firstName}  ${selectedRow?.lastName}`}
        open={isBalanceTransactionsModalOpen}
        onClose={closeModal}
      />

      <AddTransaction userId={selectedRow?._id ?? ''} open={isAddTransactionModalOpen} onClose={closeModal} onSuccess={handleSuccess} />
      <EditUser open={isEditModalOpen} onClose={closeModal} user={selectedRow} onSuccess={handleSuccess} />
    </Wrapper>
  );
};

export default Users;
