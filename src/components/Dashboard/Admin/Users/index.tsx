'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Box, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, TextField, Typography, useTheme } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import getAllUsers from '@/app/actions/admin/getAllUsers';
import { messages } from '@/constants';
import AddTransaction from './AddTransaction';
import columns from './columns';

const { GENERAL } = messages;

interface UserFilters {
  search?: string;
  balanceSorting?: '1' | '-1';
}

const Users = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();

  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState<IUsersData | null>(null);
  const [filters, setFilters] = useState<UserFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<IUserWithPopulatedBalance | null>(null);
  const [modalState, setModalState] = useState<{ type: 'edit' | 'balance' | ''; open: boolean }>({ type: '', open: false });

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

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await getAllUsers({ page, limit, ...filters });
        if (!isMounted || requestId !== requestIdRef.current) return;
        if (response.status === 'OK' && response.data) setData(response.data);
      } catch (error) {
        if (isMounted && requestId === requestIdRef.current) console.error(error || GENERAL.UNEXPECTED_ERROR);
      } finally {
        if (isMounted && requestId === requestIdRef.current) setLoading(false);
      }
    };
    fetchUsers();
    return () => {
      isMounted = false;
    };
  }, [page, limit, filters, isClient]);

  const rows = useMemo(
    () =>
      data?.users?.map(user => ({
        id: user._id,
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        company: user.company,
        phone: user.phone,
        priceList: user.pricingList?.name,
        address: user.address,
        role: user.role,
        isActive: user.isActive,
        balance: user.balance.total,
        createdAt: user.createdAt,
      })) ?? [],
    [data],
  );

  const handleOpenModal = (type: 'edit' | 'balance') => {
    setModalState({ type, open: true });
    setMenuAnchorEl(null);
  };

  const handleCloseModal = () => {
    setSelectedRow(null);
    setModalState({ type: '', open: false });
  };

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

            <MenuItem onClick={() => handleOpenModal('balance')}>
              <ListItemIcon>
                <AccountBalanceWalletIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Bakiye Ekle</ListItemText>
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
        <Typography variant="h5">Üyeler</Typography>
        <TextField
          label="Ara (isim, email, telefon...)"
          size="small"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: '300px' } }}
        />
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
            columns={usersColumns}
            loading={loading}
            autoHeight
            paginationMode="server"
            rowCount={data?.totalCount ?? 0}
            pageSizeOptions={[5, 10, 50]}
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

      <AddTransaction
        userId={selectedRow?._id ?? ''}
        open={modalState.type === 'balance' && modalState.open}
        onClose={handleCloseModal}
        onSuccess={() => {
          setFilters(prev => ({ ...prev }));
          handleCloseModal();
        }}
      />
    </Box>
  );
};

export default Users;
