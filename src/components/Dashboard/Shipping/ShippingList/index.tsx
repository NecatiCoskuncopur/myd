'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { Box, Button, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, TextField, Typography, useTheme } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';

import listShipping from '@/app/actions/shipping/listShipping';
import getUser from '@/app/actions/user/getUser';
import StyledButton from '@/components/StyledButton';
import { generalMessages } from '@/constants';
import columns from './columns';
import DeleteShipping from './DeleteShipping';

const { UNEXPECTED_ERROR } = generalMessages;

const ShippingList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();

  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState<ShippingTypes.IShippingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [inputs, setInputs] = useState({
    consigneeName: searchParams.get('consigneeName') || '',
    consigneePhone: searchParams.get('consigneePhone') || '',
    trackingNumber: searchParams.get('trackingNumber') || '',
    startDate: searchParams.get('startDate') ? moment(searchParams.get('startDate')) : null,
    endDate: searchParams.get('endDate') ? moment(searchParams.get('endDate')) : null,
  });

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<ShippingTypes.IShipping | null>(null);
  const [user, setUser] = useState<UserTypes.IUser | null>(null);

  const page = useMemo(() => Number(searchParams.get('sayfa')) || 1, [searchParams]);
  const limit = useMemo(() => Number(searchParams.get('limit')) || 10, [searchParams]);

  useEffect(() => setIsClient(true), []);
  const fetchList = async () => {
    if (!isClient) return;
    try {
      setLoading(true);
      const response = await listShipping({
        page,
        limit,
        consigneeName: searchParams.get('consigneeName') || undefined,
        consigneePhone: searchParams.get('consigneePhone') || undefined,
        trackingNumber: searchParams.get('trackingNumber') || undefined,
        startDate: searchParams.get('startDate') || undefined,
        endDate: searchParams.get('endDate') || undefined,
      });

      if (response.status === 'OK' && 'shippings' in response.data!) {
        setData(response.data as ShippingTypes.IShippingData);
      }
    } catch {
      console.error(UNEXPECTED_ERROR);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [page, limit, searchParams, isClient]);

  useEffect(() => {
    const fetchUser = async () => {
      const result = await getUser();
      if (result.status === 'OK' && result.data) {
        setUser(result.data);
      }
    };
    fetchUser();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sayfa', '1');

    if (inputs.consigneeName) params.set('consigneeName', inputs.consigneeName);
    else params.delete('consigneeName');
    if (inputs.consigneePhone) params.set('consigneePhone', inputs.consigneePhone);
    else params.delete('consigneePhone');
    if (inputs.trackingNumber) params.set('trackingNumber', inputs.trackingNumber);
    else params.delete('trackingNumber');
    if (inputs.startDate) params.set('startDate', inputs.startDate.toISOString());
    else params.delete('startDate');
    if (inputs.endDate) params.set('endDate', inputs.endDate.toISOString());
    else params.delete('endDate');

    router.push(`?${params.toString()}`);
  };

  const handleDownloadExcel = async () => {
    try {
      setDownloading(true);

      const response = await listShipping({
        download: true,
        consigneeName: inputs.consigneeName || undefined,
        consigneePhone: inputs.consigneePhone || undefined,
        trackingNumber: inputs.trackingNumber || undefined,
        startDate: inputs.startDate?.toISOString(),
        endDate: inputs.endDate?.toISOString(),
      });

      if (response.status === 'OK' && response.data && 'content' in response.data) {
        const { content, fileName } = response.data;

        const byteCharacters = atob(content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);

        const blob = new Blob([byteArray], {
          type: 'application/vnd.ms-excel',
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Excel indirilirken bir hata oluştu:', error);
    } finally {
      setDownloading(false);
    }
  };
  const rows = useMemo(() => data?.shippings ?? [], [data]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setMenuAnchorEl(null);
  };

  const handleCloseModal = () => {
    setSelectedRow(null);
    setIsModalOpen(false);
  };

  const shippingColumns: GridColDef[] = [
    ...columns,
    {
      field: 'actions',
      headerName: 'İşlemler',
      flex: 1,
      minWidth: 100,
      sortable: false,
      filterable: false,
      renderCell: params => {
        const hasTrackingNumber = !!params.row.carrier?.trackingNumber;

        return (
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
              open={menuAnchorEl !== null && selectedRow?._id === params.row._id}
              onClose={() => {
                setMenuAnchorEl(null);
                setSelectedRow(null);
              }}
            >
              <MenuItem onClick={() => router.push(`/panel/gonderilerim/${selectedRow?._id}`)}>
                <ListItemIcon>
                  <VisibilityOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>İncele</ListItemText>
              </MenuItem>

              {!hasTrackingNumber && [
                <MenuItem key="edit" onClick={() => router.push(`/panel/gonderilerim/${selectedRow?._id}/duzenle`)}>
                  <ListItemIcon>
                    <EditIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Düzenle</ListItemText>
                </MenuItem>,
                <MenuItem key="delete" onClick={() => handleOpenModal()}>
                  <ListItemIcon>
                    <DeleteOutlineIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Sil</ListItemText>
                </MenuItem>,
              ]}
            </Menu>

            {!hasTrackingNumber && (user?.barcodePermits?.length ?? 0) > 0 && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  setSelectedRow(params.row);
                }}
              >
                Barkod Oluştur
              </Button>
            )}
          </>
        );
      },
    },
  ];

  if (!isClient) return null;

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
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
        <Typography variant="h5" sx={{ mb: 3, color: theme.palette.dashboard.textSidebar }}>
          Gönderiler
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            mb: 3,
          }}
        >
          <TextField
            label="Alıcı Adı"
            size="small"
            value={inputs.consigneeName}
            onChange={e => setInputs(prev => ({ ...prev, consigneeName: e.target.value }))}
          />
          <TextField
            label="Alıcı Telefon"
            size="small"
            value={inputs.consigneePhone}
            onChange={e => setInputs(prev => ({ ...prev, consigneePhone: e.target.value }))}
          />
          <TextField
            label="Takip No"
            size="small"
            value={inputs.trackingNumber}
            onChange={e => setInputs(prev => ({ ...prev, trackingNumber: e.target.value }))}
          />
          <DatePicker
            label="Başlangıç"
            slotProps={{ textField: { size: 'small' } }}
            value={inputs.startDate}
            onChange={val => setInputs(prev => ({ ...prev, startDate: val }))}
          />
          <DatePicker
            label="Bitiş"
            slotProps={{ textField: { size: 'small' } }}
            value={inputs.endDate}
            onChange={val => setInputs(prev => ({ ...prev, endDate: val }))}
          />

          <StyledButton variant="contained" startIcon={<SearchIcon />} onClick={handleSearch} sx={{ height: 40 }}>
            Ara
          </StyledButton>

          <Button variant="outlined" color="success" startIcon={<FileDownloadIcon />} onClick={handleDownloadExcel} disabled={downloading} sx={{ height: 40 }}>
            {downloading ? 'Hazırlanıyor...' : 'Excele Aktar'}
          </Button>
        </Box>

        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <Box sx={{ minWidth: 'max-content', width: '100%' }}>
            <DataGrid
              rows={rows}
              columns={shippingColumns}
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
        <DeleteShipping
          id={selectedRow?._id ?? ''}
          open={isModalOpen}
          onClose={handleCloseModal}
          onSuccess={() => {
            handleCloseModal();
            fetchList();
          }}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default ShippingList;
