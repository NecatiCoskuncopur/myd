'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import { Wrapper, TableHeader, TableWrapper } from '@/components';
import FilterSection from './FilterSection';
import getAllUsers from '@/app/actions/admin/getAllUsers';
import { generalMessages } from '@/constants';
import AddTransaction from './AddTransaction';
import columns from './columns';
import EditUser from './EditUser';
import { UserTypes } from '@/types/user';
import { AdminTypes } from '@/types/admin';

const { UNEXPECTED_ERROR } = generalMessages;

const Users = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState<AdminTypes.IUsersData | null>(null);
  const [loading, setLoading] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<UserTypes.IUserWithPopulatedBalance | null>(null);

  const [modalState, setModalState] = useState<{
    type: 'edit' | 'balance' | '';
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

    const fetchUsers = async () => {
      try {
        setLoading(true);

        const response = await getAllUsers({
          page,
          limit,
          firstName: searchParams.get('firstName') || '',
          lastName: searchParams.get('lastName') || '',
          company: searchParams.get('company') || '',
          phone: searchParams.get('phone') || '',
          email: searchParams.get('email') || '',
        });

        if (!isMounted || requestId !== requestIdRef.current) return;

        if (response.status === 'OK' && response.data) {
          setData(response.data);
        }
      } catch (error) {
        if (isMounted && requestId === requestIdRef.current) {
          console.error(error || UNEXPECTED_ERROR);
        }
      } finally {
        if (isMounted && requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, [page, limit, searchParams, isClient]);

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
        priceListId: user.pricingList?._id,
        address: user.address,
        role: user.role,
        isActive: user.isActive,
        barcodePermits: user.barcodePermits,
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
              <ListItemText> Bakiye Hareketi Ekle</ListItemText>
            </MenuItem>
          </Menu>
        </>
      ),
    },
  ];

  if (!isClient) return null;

  return (
    <Wrapper>
      <TableHeader title="Üyeler" subTitle="Kullanıcı hesapları, erişim izinleri ve üyelik hareketleri özeti." stacked={true}>
        <FilterSection searchParams={searchParams} />
      </TableHeader>
      <TableWrapper>
        <DataGrid
          rows={rows}
          columns={usersColumns}
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
              children: 'Henüz kayıtlı bir üye bulunmuyor.',
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
      <AddTransaction
        userId={selectedRow?._id ?? ''}
        open={modalState.type === 'balance' && modalState.open}
        onClose={handleCloseModal}
        onSuccess={() => {
          handleCloseModal();
        }}
      />

      <EditUser
        open={modalState.type === 'edit' && modalState.open}
        onClose={handleCloseModal}
        user={selectedRow}
        onSuccess={() => {
          handleCloseModal();
        }}
      />
    </Wrapper>
  );
};

export default Users;
