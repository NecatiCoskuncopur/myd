'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCarrierIcon } from '@/constants/carrierIcons';

import { DeleteOutlined } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import {
  Alert,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';

import listShipping from '@/app/actions/shipping/listShipping';
import getUser from '@/app/actions/user/getUser';
import createBarcode from '@/app/actions/shipping/createBarcode';
import getPaper from '@/app/actions/shipping/getPaper';
import getUserPermittedAccounts from '@/app/actions/user/getUserPermittedAccounts';
import { TableHeader, TableWrapper, Wrapper, DeleteShipping } from '@/components';
import { generalMessages } from '@/constants';
import columns from './columns';
import { UserTypes } from '@/types/user';
import FilterSection from './FilterSection';

const { UNEXPECTED_ERROR } = generalMessages;

const ShippingList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState<ShippingTypes.IShippingData | null>(null);
  const [loading, setLoading] = useState(false);

  const [actionIconButton, setActionIconButton] = useState<HTMLElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selectedRow, setSelectedRow] = useState<ShippingTypes.IShipping | null>(null);
  const [user, setUser] = useState<UserTypes.ICleanUser | null>(null);

  const [accounts, setAccounts] = useState<Partial<CarrierAccountTypes.ICarrierAccount>[]>([]);

  const [barcodeDialogOpen, setBarcodeDialogOpen] = useState(false);
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const [barcodeError, setBarcodeError] = useState<string | null>(null);

  const canCreateBarcode = (user?.barcodePermits?.length ?? 0) > 0;

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

  useEffect(() => {
    if (!canCreateBarcode) return;

    const fetchAccounts = async () => {
      const res = await getUserPermittedAccounts();
      if (res.status === 'OK' && res.data) {
        setAccounts(res.data);
      }
    };

    fetchAccounts();
  }, [canCreateBarcode]);

  const closeActionsMenu = () => {
    setMenuOpen(false);
    setTimeout(() => {
      if (!deleteOpen) {
        setActionIconButton(null);
        setSelectedRow(null);
      }
    }, 200);
  };

  const handleOpenDeletePopup = () => {
    setMenuOpen(false);
    setDeleteOpen(true);
  };

  const handleCloseDeletePopup = () => {
    setDeleteOpen(false);
    setActionIconButton(null);
    setSelectedRow(null);
  };

  const handleCreateBarcode = async (account: Partial<CarrierAccountTypes.ICarrierAccount>) => {
    const shippingId = selectedRow?._id;
    if (!shippingId || !account.carrier || !account.accountNumber) return;

    closeActionsMenu();
    setBarcodeDialogOpen(true);
    setBarcodeLoading(true);
    setBarcodeError(null);

    try {
      const res = await createBarcode({
        shippingId,
        firm: account.carrier as 'UPS' | 'FEDEX',
        accountNumber: account.accountNumber,
      });

      if (res.status === 'OK') {
        fetchList();
      } else {
        setBarcodeError(res.message || 'Barkod oluşturulamadı');
      }
    } catch {
      setBarcodeError('Sistem hatası oluştu');
    } finally {
      setBarcodeLoading(false);
    }
  };

  const handleDownloadPaper = async (type: 'labels' | 'invoices') => {
    const shippingId = selectedRow?._id;
    closeActionsMenu();
    if (!shippingId) return;

    try {
      const res = await getPaper({ shippingId, type });

      if (res.status === 'OK' && res.data?.file) {
        const pdfUrl = `data:application/pdf;base64,${res.data.file}`;
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(`<iframe src="${pdfUrl}" width="100%" height="100%" style="border:none; margin:0; padding:0; overflow:hidden;"></iframe>`);
          newWindow.document.title = type === 'labels' ? 'Kargo Barkodu' : 'Proforma Fatura';
        }
      } else {
        alert(res.message || 'Evrak indirilirken bir hata oluştu.');
      }
    } catch (error) {
      console.error(error);
      alert('Beklenmedik bir hata oluştu.');
    }
  };

  const rows = useMemo(() => data?.shippings ?? [], [data]);

  const shippingColumns: GridColDef[] = useMemo(
    () => [
      ...columns,
      {
        field: 'actions',
        headerName: 'İşlemler',
        flex: 1,
        minWidth: 120,
        sortable: false,
        filterable: false,
        renderCell: params => (
          <IconButton
            size="small"
            onClick={e => {
              setSelectedRow(params.row);
              setActionIconButton(e.currentTarget);
              setMenuOpen(true);
            }}
          >
            <MoreVertIcon />
          </IconButton>
        ),
      },
    ],
    [],
  );

  if (!isClient) return null;

  const hasTrackingNumber = !!selectedRow?.carrier?.trackingNumber;
  const showBarcodeItem = !hasTrackingNumber && canCreateBarcode;

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Wrapper>
        <TableHeader title="Gönderilerim" subTitle="Gönderilerinize ait tüm detaylar ve güncel durum bilgileri." stacked={true}>
          <FilterSection searchParams={searchParams} />
        </TableHeader>
        <TableWrapper>
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
            slotProps={{
              noRowsOverlay: {
                children: 'Henüz kayıtlı bir gönderiniz bulunmuyor.',
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
        <Menu anchorEl={actionIconButton} open={menuOpen} onClose={closeActionsMenu}>
          <MenuItem
            onClick={() => {
              const id = selectedRow?._id;
              closeActionsMenu();
              router.push(`/panel/gonderilerim/${id}`);
            }}
          >
            <ListItemIcon>
              <VisibilityOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>İncele</ListItemText>
          </MenuItem>

          {!hasTrackingNumber && <Divider />}
          {!hasTrackingNumber && (
            <MenuItem
              onClick={() => {
                const id = selectedRow?._id;
                closeActionsMenu();
                router.push(`/panel/gonderilerim/${id}/duzenle`);
              }}
            >
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Düzenle</ListItemText>
            </MenuItem>
          )}

          {!hasTrackingNumber && (
            <MenuItem onClick={handleOpenDeletePopup}>
              <ListItemIcon>
                <DeleteOutlined fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText sx={{ color: 'error.main' }}>Sil</ListItemText>
            </MenuItem>
          )}

          {showBarcodeItem && <Divider />}
          {showBarcodeItem &&
            (accounts.length === 0 ? (
              <MenuItem disabled>
                <ListItemIcon>
                  <QrCode2OutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Barkod Hesabı Bulunamadı</ListItemText>
              </MenuItem>
            ) : (
              accounts.map(acc => {
                const carrierInfo = getCarrierIcon(acc.carrier);

                return (
                  <MenuItem key={acc._id} onClick={() => handleCreateBarcode(acc)}>
                    <ListItemIcon sx={{ minWidth: 32, display: 'flex', alignItems: 'center' }}>{carrierInfo.icon}</ListItemIcon>
                    <ListItemText> {acc.name}</ListItemText>
                  </MenuItem>
                );
              })
            ))}

          {hasTrackingNumber && <Divider />}
          {hasTrackingNumber && (
            <MenuItem onClick={() => handleDownloadPaper('labels')}>
              <ListItemIcon>
                <DescriptionOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Barkod İndir (Label)</ListItemText>
            </MenuItem>
          )}
          {hasTrackingNumber && (
            <MenuItem onClick={() => handleDownloadPaper('invoices')}>
              <ListItemIcon>
                <ReceiptLongOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Proforma Fatura İndir</ListItemText>
            </MenuItem>
          )}
        </Menu>
        <Dialog open={barcodeDialogOpen} onClose={() => !barcodeLoading && setBarcodeDialogOpen(false)}>
          <DialogContent sx={{ minWidth: 300, textAlign: 'center' }}>
            {barcodeLoading && (
              <Box>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Barkod oluşturuluyor...</Typography>
              </Box>
            )}

            {!barcodeLoading && barcodeError && (
              <Alert severity="error" onClose={() => setBarcodeError(null)}>
                {barcodeError}
              </Alert>
            )}

            {!barcodeLoading && !barcodeError && <Typography>Barkod başarıyla oluşturuldu</Typography>}
          </DialogContent>
        </Dialog>
        <DeleteShipping
          id={selectedRow?._id ?? ''}
          open={deleteOpen}
          anchorEl={actionIconButton}
          onClose={handleCloseDeletePopup}
          onSuccess={() => {
            handleCloseDeletePopup();
            fetchList();
          }}
        />
      </Wrapper>
    </LocalizationProvider>
  );
};

export default ShippingList;
