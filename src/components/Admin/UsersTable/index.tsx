'use client';

import React from 'react';

import { useSearchParams } from 'next/navigation';

import { GridColDef } from '@mui/x-data-grid';

import { GenericDataGrid, TableHeader, Wrapper } from '@/components';
import AddTransaction from './AddTransaction';
import columns from './columns';
import EditUser from './EditUser';
import FilterSection from './FilterSection';
import UserActionsMenu from './UserActionsMenu';
import useUserActions from './hooks/useUserActions';
import useUsersList from './hooks/useUsersList';

const Users = () => {
  const searchParams = useSearchParams();

  const { data, rows, loading, page, limit, refetch } = useUsersList(searchParams);

  const { selectedRow, menuAnchorEl, isEditModalOpen, isBalanceModalOpen, openMenu, closeMenu, openEditModal, openBalanceModal, closeModal } = useUserActions();

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
          onBalance={openBalanceModal}
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
        loading={loading}
        totalCount={data?.totalCount}
        page={page}
        limit={limit}
        searchParams={searchParams}
        noRowsMessage="Henüz kayıtlı bir üye bulunmuyor."
      />

      <AddTransaction userId={selectedRow?._id ?? ''} open={isBalanceModalOpen} onClose={closeModal} onSuccess={handleSuccess} />
      <EditUser open={isEditModalOpen} onClose={closeModal} user={selectedRow} onSuccess={handleSuccess} />
    </Wrapper>
  );
};

export default Users;
