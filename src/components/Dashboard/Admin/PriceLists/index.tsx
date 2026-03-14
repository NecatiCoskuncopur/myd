'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Box, IconButton, Link, ListItemIcon, ListItemText, Menu, MenuItem, TextField, Typography, useTheme } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import getPricingLists from '@/app/actions/admin/getPricingLists';
import { messages } from '@/constants';
import columns from './columns';
import CreateList from './CreateList';
import UpdateList from './UpdateList';

interface PricingListFilters {
  search?: string;
}
const { GENERAL } = messages;

const PriceLists = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();

  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState<IPricingListData | null>(null);
  const [filters, setFilters] = useState<PricingListFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<IPricingList | null>(null);
  const [modalState, setModalState] = useState<{ type: 'edit' | 'create' | ''; open: boolean }>({ type: '', open: false });

  const requestIdRef = useRef(0);
  const page = useMemo(() => Number(searchParams.get('sayfa')) || 1, [searchParams]);
  const limit = useMemo(() => Number(searchParams.get('limit')) || 5, [searchParams]);

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    if (!isClient) return;
    const delay = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm || undefined }));
    }, 100);
    return () => clearTimeout(delay);
  }, [searchTerm, isClient]);

  useEffect(() => {
    if (!isClient) return;
    let isMounted = true;
    const requestId = ++requestIdRef.current;

    const fetchPricingLists = async () => {
      try {
        setLoading(true);
        const response = await getPricingLists({ page, limit, ...filters });
        if (!isMounted || requestId !== requestIdRef.current) return;
        if (response.status === 'OK' && response.data) setData(response.data);
      } catch (error) {
        if (isMounted && requestId === requestIdRef.current) console.error(error || GENERAL.UNEXPECTED_ERROR);
      } finally {
        if (isMounted && requestId === requestIdRef.current) setLoading(false);
      }
    };
    fetchPricingLists();
    return () => {
      isMounted = false;
    };
  }, [page, limit, filters, isClient]);

  const rows = useMemo(
    () =>
      data?.pricingLists?.map(pricingList => ({
        id: pricingList._id,
        _id: pricingList._id,
        name: pricingList.name,
        zone: pricingList.zone,
        createdAt: pricingList.createdAt,
        updatedAt: pricingList.updatedAt,
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
          </Menu>
        </>
      ),
    },
  ];

  if (!isClient) return null;

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        backgroundColor: theme.palette.dashboard.sidebar,
        color: theme.palette.dashboard.textSidebar,
        p: 5,
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 3,
        }}
      >
        <Typography variant="h5">Fiyat Listeleri</Typography>
        <TextField
          label="Ara (Liste Adı)"
          size="small"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: '300px' } }}
        />
        <Link
          onClick={() => {
            handleOpenModal('create');
          }}
        >
          Yeni Liste Oluştur
        </Link>
      </Box>
      <Box
        sx={{
          width: '100%',
          overflowX: 'auto',
        }}
      >
        <Box sx={{ minWidth: 'max-content', width: '100%' }}>
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
            sx={{
              '& .MuiDataGrid-main': {
                overflowX: 'hidden',
              },
              minWidth: 1200,
            }}
          />
        </Box>
      </Box>
      <CreateList
        open={modalState.type === 'create' && modalState.open}
        onClose={handleCloseModal}
        onSuccess={() => {
          setFilters(prev => ({ ...prev }));
          handleCloseModal();
        }}
      />
      <UpdateList
        list={selectedRow}
        open={modalState.type === 'edit' && modalState.open}
        onClose={handleCloseModal}
        onSuccess={() => {
          setFilters(prev => ({ ...prev }));
          handleCloseModal();
        }}
      />
    </Box>
  );
};

export default PriceLists;
