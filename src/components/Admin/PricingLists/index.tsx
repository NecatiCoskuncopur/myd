'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Alert, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Snackbar, useTheme } from '@mui/material';
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
  const [actionIconButton, setActionIconButton] = useState<HTMLElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const [selectedRow, setSelectedRow] = useState<PricingListTypes.IPricingList | null>(null);
  const [modalState, setModalState] = useState<{ type: 'edit' | 'create' | 'delete' | ''; open: boolean }>({ type: '', open: false });

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const requestIdRef = useRef(0);
  const page = Number(searchParams.get('sayfa')) || 1;
  const limit = Number(searchParams.get('limit')) || 5;

  useEffect(() => setIsClient(true), []);
  const name = searchParams.get('name') ?? undefined;

  const fetchPricingLists = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const response = await getPricingLists({
        page,
        limit,
        name,
      });

      if (requestId !== requestIdRef.current) return;

      if (response.status === 'OK' && response.data) {
        setData(response.data);
      } else {
        setData(null);

        setSnackbar({
          open: true,
          message: response.message ?? generalMessages.UNEXPECTED_ERROR,
        });
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [page, limit, name]);

  useEffect(() => {
    if (!isClient) return;

    fetchPricingLists();
  }, [isClient, fetchPricingLists]);

  const rows = useMemo(
    () =>
      data?.pricingLists?.map(pricingList => ({
        id: pricingList._id,
        ...pricingList,
      })) ?? [],
    [data],
  );

  const handleOpenModal = (type: 'edit' | 'create' | 'delete') => {
    setMenuOpen(false);
    setModalState({ type, open: true });
  };

  const handleCloseModal = () => {
    setSelectedRow(null);
    setActionIconButton(null);
    setModalState({ type: '', open: false });
  };

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
          <>
            <IconButton
              size="small"
              onClick={e => {
                setSelectedRow(params.row);
                setActionIconButton(e.currentTarget); // Doğrudan 3 nokta butonunu hedefler
                setMenuOpen(true);
              }}
            >
              <MoreVertIcon />
            </IconButton>

            <Menu
              anchorEl={actionIconButton}
              open={menuOpen && selectedRow?._id === params.row.id}
              onClose={() => {
                setMenuOpen(false);
                setActionIconButton(null);
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
    ],
    [theme, actionIconButton, menuOpen, selectedRow],
  );

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
            const params = new URLSearchParams(searchParams);
            params.set('sayfa', String(isPageSizeChanged ? 1 : model.page + 1));
            params.set('limit', String(model.pageSize));
            router.push(`?${params.toString()}`);
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
          void fetchPricingLists();
        }}
      />
      <UpdateList
        list={selectedRow}
        open={modalState.type === 'edit' && modalState.open}
        onClose={handleCloseModal}
        onSuccess={() => {
          handleCloseModal();
          void fetchPricingLists();
        }}
      />

      <DeleteList
        list={selectedRow}
        anchorEl={actionIconButton}
        open={modalState.type === 'delete' && modalState.open}
        onClose={handleCloseModal}
        onSuccess={msg => {
          handleCloseModal();
          setSnackbar({ open: true, message: msg });
          void fetchPricingLists();
        }}
      />

      <Snackbar open={snackbar.open} autoHideDuration={2500} onClose={() => setSnackbar({ open: false, message: '' })}>
        <Alert severity="success" variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Wrapper>
  );
};

export default PriceLists;
