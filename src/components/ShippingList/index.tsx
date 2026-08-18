'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

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
import { GridColDef } from '@mui/x-data-grid';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';

import listShipping from '@/app/actions/shipping/listShipping';
import getUser from '@/app/actions/user/getUser';
import createBarcode from '@/app/actions/shipping/createBarcode';
import getPaper from '@/app/actions/shipping/getPaper';
import getUserPermittedAccounts from '@/app/actions/user/getUserPermittedAccounts';
import { TableHeader, Wrapper, DeleteShipping, GenericDataGrid } from '@/components';
import { Carrier, generalMessages } from '@/constants';
import columns from './columns';
import { UserTypes } from '@/types/user';
import FilterSection from './FilterSection';
import { ShippingTypes } from '@/types/shipping';
import { CarrierAccountTypes } from '@/types/carrierAccount';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { getCustomerPrice } from '@/lib/getCustomerPrice';
import getUserPricingList from '@/app/actions/user/getUserPricingList';

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
  const [user, setUser] = useState<UserTypes.UserDto | null>(null);
  const [pricingList, setPricingList] = useState<PricingListTypes.IPricingList | null>(null);
  const [accounts, setAccounts] = useState<Partial<CarrierAccountTypes.ICarrierAccount>[]>([]);
  const { showSnackbar } = useSnackbar();
  const [barcodeDialogOpen, setBarcodeDialogOpen] = useState(false);
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const [barcodeError, setBarcodeError] = useState<string | null>(null);

  const canCreateBarcode = (user?.barcodePermits?.length ?? 0) > 0;

  const requestIdRef = useRef(0);
  const page = Number(searchParams.get('sayfa')) || 1;
  const limit = Number(searchParams.get('limit')) || 5;

  useEffect(() => setIsClient(true), []);

  const filters = useMemo(
    () => ({
      trackingNumber: searchParams.get('trackingNumber') || undefined,
      senderName: searchParams.get('senderName') || undefined,
      consigneeName: searchParams.get('consigneeName') || undefined,
      consigneeCompany: searchParams.get('consigneeCompany') || undefined,
      consigneePhone: searchParams.get('consigneePhone') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    }),
    [searchParams],
  );

  const fetchList = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    setLoading(true);
    try {
      const response = await listShipping({
        page,
        limit,
        ...filters,
      });

      if (requestId !== requestIdRef.current) return;

      if (response.status === 'OK' && response.data && 'shippings' in response.data) {
        setData(response.data);
        return;
      }

      setData(null);

      showSnackbar(response.message ?? generalMessages.UNEXPECTED_ERROR, 'error');
    } catch {
      if (requestId !== requestIdRef.current) return;

      setData(null);
      showSnackbar(generalMessages.UNEXPECTED_ERROR, 'error');
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [page, limit, filters]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

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
      } else {
        console.error(res.message || UNEXPECTED_ERROR);
      }
    };

    fetchAccounts();
  }, [canCreateBarcode]);

  useEffect(() => {
    const fetchPricingList = async () => {
      const res = await getUserPricingList();
      if (res.status === 'OK' && res.data) {
        setPricingList(res.data);
      } else {
        console.error(res.message || UNEXPECTED_ERROR);
      }
    };

    fetchPricingList();
  }, []);

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
        hasCustomInfo: !!account.hasCustomInfo,
        customInfo: account.customInfo,
        shippingId,
        displayName: account.displayName!,
        firm: account.carrier as Carrier,
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
      const response = await getPaper({ shippingId, type });

      if (response.status !== 'OK' || !response.data?.file) {
        showSnackbar(response.message ?? 'Evrak indirilirken bir hata oluştu.', 'error');
        return;
      }

      const binary = atob(response.data.file);
      const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error(error);
      showSnackbar(UNEXPECTED_ERROR, 'error');
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
  const hasLabel = selectedRow?.labeledAt ? new Date(selectedRow.labeledAt).setMonth(new Date(selectedRow.labeledAt).getMonth() + 3) > Date.now() : false;
  const showBarcodeItem = !hasTrackingNumber && canCreateBarcode;

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Wrapper>
        <TableHeader title="Gönderilerim" subTitle="Gönderilerinize ait tüm detaylar ve güncel durum bilgileri." stacked={true}>
          <FilterSection searchParams={searchParams} />
        </TableHeader>
        <GenericDataGrid
          rows={rows}
          columns={shippingColumns}
          loading={loading}
          totalCount={data?.totalCount}
          page={page}
          limit={limit}
          searchParams={searchParams}
          noRowsMessage="Henüz kayıtlı bir gönderiniz bulunmuyor."
        />
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
                const customerPrice = getCustomerPrice({
                  countryCode: selectedRow?.consignee?.address.country ?? '',
                  weight: selectedRow?.package.weight ?? 0,
                  pricingList,
                });

                return (
                  <MenuItem key={acc._id} onClick={() => handleCreateBarcode(acc)}>
                    <ListItemText primary={acc.displayName} secondary={` Ödenecek Tutar: ${customerPrice ?? '-'} $`} />
                  </MenuItem>
                );
              })
            ))}

          {hasTrackingNumber && hasLabel && <Divider />}
          {hasTrackingNumber && hasLabel && (
            <MenuItem onClick={() => handleDownloadPaper('labels')}>
              <ListItemIcon>
                <DescriptionOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Barkod İndir (Label)</ListItemText>
            </MenuItem>
          )}
          {hasTrackingNumber && hasLabel && (
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
