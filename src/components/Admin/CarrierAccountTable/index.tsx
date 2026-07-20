'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import getCarrierAccounts from '@/app/actions/admin/getCarrierAccounts';
import { Wrapper, TableHeader, TableWrapper, StyledButton } from '@/components';
import { generalMessages } from '@/constants';
import columns from './columns';
import CreateCarrierAccountForm from './CreateCarrierAccountForm';
import FilterSection from './FilterSection';
import UpdateCarrierAccountForm from './UpdateCarrierAccountForm';

const CarrierAccountTable = () => {
  const router = useRouter();
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

  const page = useMemo(() => Number(searchParams.get('sayfa')) || 1, [searchParams]);
  const limit = useMemo(() => Number(searchParams.get('limit')) || 5, [searchParams]);

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    if (!isClient) return;

    let isMounted = true;
    const requestId = ++requestIdRef.current;

    const fetchCarrierAccounts = async () => {
      try {
        setLoading(true);

        const response = await getCarrierAccounts({
          page,
          limit,
          name: searchParams.get('name') || undefined,
          accountNumber: searchParams.get('accountNumber') || undefined,
          carrier: (searchParams.get('carrier') as 'FEDEX' | 'UPS') || undefined,
          isActive: searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined,
        });

        if (!isMounted || requestId !== requestIdRef.current) return;

        if (response.status === 'OK' && response.data) {
          setData(response.data);
        }
      } catch (error) {
        if (isMounted && requestId === requestIdRef.current) {
          console.error(error || generalMessages.UNEXPECTED_ERROR);
        }
      } finally {
        if (isMounted && requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    };

    fetchCarrierAccounts();

    return () => {
      isMounted = false;
    };
  }, [page, limit, searchParams, isClient]);

  const rows = useMemo(
    () =>
      data?.carrierAccounts?.map(account => ({
        id: account._id,
        _id: account._id,
        name: account.name,
        carrier: account.carrier,
        accountNumber: account.accountNumber,
        credentials: account.credentials,
        meta: account.meta,
        isActive: account.isActive,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      })) ?? [],
    [data],
  );

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
      <TableWrapper>
        <DataGrid
          rows={rows}
          columns={accountColumns}
          loading={loading}
          autoHeight
          paginationMode="server"
          rowCount={data?.totalCount ?? 0}
          pageSizeOptions={[1, 5, 10, 50]}
          paginationModel={{ page: page - 1, pageSize: limit }}
          onPaginationModelChange={model => {
            const isPageSizeChanged = model.pageSize !== limit;
            router.push(`?sayfa=${isPageSizeChanged ? 1 : model.page + 1}&limit=${model.pageSize}`);
          }}
          slotProps={{
            noRowsOverlay: {
              children: 'Sistemde tanımlı kargo hesabı bulunamadı. Yeni bir taşıyıcı firma hesabı ekleyerek başlayabilirsiniz.',
            },
          }}
          sx={{
            '& .MuiDataGrid-main': {
              overflowX: 'hidden',
            },
            minWidth: 1200,
          }}
        />
      </TableWrapper>
      <CreateCarrierAccountForm
        open={modalState.type === 'create' && modalState.open}
        onClose={handleCloseModal}
        onSuccess={() => {
          handleCloseModal();
        }}
      />

      <UpdateCarrierAccountForm
        open={modalState.type === 'edit' && modalState.open}
        account={selectedRow}
        onClose={handleCloseModal}
        onSuccess={() => {
          handleCloseModal();
        }}
      />
    </Wrapper>
  );
};

export default CarrierAccountTable;
