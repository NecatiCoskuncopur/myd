'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';

import getCarrierAccounts from '@/app/actions/admin/getCarrierAccounts';
import { Wrapper, TableHeader, StyledButton, GenericDataGrid } from '@/components';
import { Carrier } from '@/constants';
import columns from './columns';
import CreateCarrierAccountForm from './CreateCarrierAccountForm';
import FilterSection from './FilterSection';
import UpdateCarrierAccountForm from './UpdateCarrierAccountForm';
import { CarrierAccountTypes } from '@/types/carrierAccount';

const CarrierAccountTable = () => {
  const searchParams = useSearchParams();

  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState<CarrierAccountTypes.ICarrierAccountData | null>(null);
  const [loading, setLoading] = useState(false);

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<CarrierAccountTypes.ICarrierAccount | null>(null);

  const [modalState, setModalState] = useState<{
    type: 'edit' | 'create' | '';
    open: boolean;
  }>({ type: '', open: false });

  const requestIdRef = useRef(0);

  const page = Number(searchParams.get('sayfa')) || 1;
  const limit = Number(searchParams.get('limit')) || 5;

  useEffect(() => setIsClient(true), []);

  const fetchCarrierAccounts = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    setLoading(true);

    const response = await getCarrierAccounts({
      page,
      limit,
      name: searchParams.get('name') || undefined,
      displayName: searchParams.get('displayName') || undefined,
      accountNumber: searchParams.get('accountNumber') || undefined,
      carrier: (searchParams.get('carrier') as Carrier) || undefined,
      isActive: searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined,
    });

    if (requestId === requestIdRef.current) {
      if (response.status === 'OK' && response.data) {
        setData(response.data);
      } else {
        console.error(response.message);
      }

      setLoading(false);
    }
  }, [page, limit, searchParams]);

  useEffect(() => {
    if (!isClient) return;

    fetchCarrierAccounts();
  }, [isClient, fetchCarrierAccounts]);

  const rows =
    data?.carrierAccounts.map(account => ({
      id: account._id,
      ...account,
    })) ?? [];

  const handleOpenModal = (type: 'edit' | 'create') => {
    setModalState({ type, open: true });
    setMenuAnchorEl(null);
  };

  const handleCloseModal = () => {
    setSelectedRow(null);
    setModalState({ type: '', open: false });
  };

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
        <>
          <IconButton
            size="small"
            onClick={e => {
              setSelectedRow(params.row);
              setMenuAnchorEl(e.currentTarget);
            }}
          >
            <MoreVertIcon />
          </IconButton>

          <Menu
            anchorEl={menuAnchorEl}
            open={menuAnchorEl !== null && selectedRow?._id === params.row.id}
            onClose={() => {
              setMenuAnchorEl(null);
              setSelectedRow(null);
            }}
          >
            <MenuItem onClick={() => handleOpenModal('edit')}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Düzenle</ListItemText>
            </MenuItem>
          </Menu>
        </>
      ),
    },
  ];

  if (!isClient) return null;

  return (
    <Wrapper>
      <TableHeader title="Kargo Hesapları" subTitle="Entegre taşıyıcı firma hesaplarınızın listesi ve bağlantı detayları.">
        <StyledButton
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal('create')}
          sx={{ flexShrink: 0, whiteSpace: 'nowrap', alignSelf: { xs: 'stretch', sm: 'center' } }}
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
      <CreateCarrierAccountForm
        open={modalState.type === 'create' && modalState.open}
        onClose={handleCloseModal}
        onSuccess={() => {
          handleCloseModal();
          void fetchCarrierAccounts();
        }}
      />

      <UpdateCarrierAccountForm
        open={modalState.type === 'edit' && modalState.open}
        account={selectedRow}
        onClose={handleCloseModal}
        onSuccess={() => {
          handleCloseModal();
          void fetchCarrierAccounts();
        }}
      />
    </Wrapper>
  );
};

export default CarrierAccountTable;
