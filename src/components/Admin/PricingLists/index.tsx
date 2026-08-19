'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem, useTheme } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';

import { Wrapper, TableHeader, StyledButton, GenericDataGrid } from '@/components';
import getPricingLists from '@/app/actions/admin/getPricingLists';
import { CarrierAccountTypeEnum, generalMessages } from '@/constants';
import columns from './columns';
import CreateList from './CreateList';
import UpdateList from './UpdateList';
import DeleteList from './DeleteList';
import FilterSection from './FilterSection';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { PricingListTypes } from '@/types/pricingList';

const PriceLists = () => {
  const searchParams = useSearchParams();
  const theme = useTheme();

  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState<PricingListTypes.IPricingListData | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionIconButton, setActionIconButton] = useState<HTMLElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const [selectedRow, setSelectedRow] = useState<PricingListTypes.IPricingList | null>(null);
  const [modalState, setModalState] = useState<{ type: 'edit' | 'create' | 'delete' | ''; open: boolean }>({ type: '', open: false });

  const { showSnackbar } = useSnackbar();

  const requestIdRef = useRef(0);
  const page = Number(searchParams.get('sayfa')) || 1;
  const limit = Number(searchParams.get('limit')) || 5;

  useEffect(() => setIsClient(true), []);

  const fetchPricingLists = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const response = await getPricingLists({
        page,
        limit,
        name: searchParams.get('name') ?? undefined,
        listType: (searchParams.get('listType') as CarrierAccountTypeEnum) ?? undefined,
      });

      if (requestId !== requestIdRef.current) return;

      if (response.status === 'OK' && response.data) {
        setData(response.data);
      } else {
        setData(null);

        showSnackbar(response.message ?? generalMessages.UNEXPECTED_ERROR, 'error');
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [page, limit, searchParams]);

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
      <GenericDataGrid
        rows={rows}
        columns={priceListsColumns}
        loading={loading}
        totalCount={data?.totalCount}
        page={page}
        limit={limit}
        searchParams={searchParams}
        noRowsMessage="Sistemde tanımlı fiyat listesi bulunamadı."
      />

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
          showSnackbar(msg, 'success');
          void fetchPricingLists();
        }}
      />
    </Wrapper>
  );
};

export default PriceLists;
