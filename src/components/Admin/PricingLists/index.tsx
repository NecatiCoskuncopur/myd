'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem, useTheme } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import { Wrapper, TableHeader, TableWrapper, StyledButton } from '@/components';
import getPricingLists from '@/app/actions/admin/getPricingLists';
import { generalMessages } from '@/constants';
import columns from './columns';
import CreateList from './CreateList';
import UpdateList from './UpdateList';
import DeleteList from './DeleteList';
import FilterSection from './FilterSection';

const PriceLists = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();

  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState<PricingListTypes.IPricingListData | null>(null);
  const [loading, setLoading] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<PricingListTypes.IPricingList | null>(null);
  const [modalState, setModalState] = useState<{ type: 'edit' | 'create' | 'delete' | ''; open: boolean }>({ type: '', open: false });

  const requestIdRef = useRef(0);
  const page = useMemo(() => Number(searchParams.get('sayfa')) || 1, [searchParams]);
  const limit = useMemo(() => Number(searchParams.get('limit')) || 5, [searchParams]);

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    if (!isClient) return;
    let isMounted = true;
    const requestId = ++requestIdRef.current;

    const fetchPricingLists = async () => {
      try {
        setLoading(true);
        const response = await getPricingLists({ page, limit, name: searchParams.get('name') || undefined });
        if (!isMounted || requestId !== requestIdRef.current) return;
        if (response.status === 'OK' && response.data) setData(response.data);
      } catch (error) {
        if (isMounted && requestId === requestIdRef.current) console.error(error || generalMessages.UNEXPECTED_ERROR);
      } finally {
        if (isMounted && requestId === requestIdRef.current) setLoading(false);
      }
    };

    fetchPricingLists();

    return () => {
      isMounted = false;
    };
  }, [page, limit, searchParams, isClient]);

  const rows = useMemo(
    () =>
      data?.pricingLists?.map(pricingList => ({
        id: pricingList._id,
        _id: pricingList._id,
        name: pricingList.name,
        zone: pricingList.zone,
        isDefault: pricingList.isDefault,
        createdAt: pricingList.createdAt,
        updatedAt: pricingList.updatedAt,
      })) ?? [],
    [data],
  );

  const handleOpenModal = (type: 'edit' | 'create' | 'delete') => {
    setModalState({ type, open: true });
    setMenuAnchorEl(null);
  };

  const handleCloseModal = () => {
    setSelectedRow(null);
    setModalState({ type: '', open: false });
  };

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

            <MenuItem
              onClick={() => handleOpenModal('delete')}
              disabled={params.row.isDefault}
              sx={{ color: params.row.isDefault ? 'inherit' : theme.palette.error.main }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" sx={{ color: params.row.isDefault ? 'inherit' : theme.palette.error.main }} />
              </ListItemIcon>
              <ListItemText>{params.row.isDefault ? 'Varsayılan (Silinemez)' : 'Sil'}</ListItemText>
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
          Yeni Liste Oluştur
        </StyledButton>
      </TableHeader>
      <FilterSection searchParams={searchParams} />
      <TableWrapper>
        <DataGrid
          rows={rows}
          columns={priceListsColumns}
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
              children: 'Sistemde tanımlı fiyat listesi bulunamadı.',
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
      <CreateList
        open={modalState.type === 'create' && modalState.open}
        onClose={handleCloseModal}
        onSuccess={() => {
          handleCloseModal();
        }}
      />
      <UpdateList
        list={selectedRow}
        open={modalState.type === 'edit' && modalState.open}
        onClose={handleCloseModal}
        onSuccess={() => {
          handleCloseModal();
        }}
      />
      <DeleteList
        list={selectedRow}
        open={modalState.type === 'delete' && modalState.open}
        onClose={handleCloseModal}
        onSuccess={() => {
          handleCloseModal();
        }}
      />
    </Wrapper>
  );
};

export default PriceLists;
