'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import createBarcode from '@/app/actions/shipping/createBarcode';
import getPaper from '@/app/actions/shipping/getPaper';
import { TableHeader, Wrapper } from '@/components';
import { Carrier, generalMessages } from '@/constants';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { CarrierAccountTypes } from '@/types/carrierAccount';
import useShippingActions from './hooks/useShippingActions';
import useShippingList from './hooks/useShippingList';
import useShippingUser from './hooks/useShippingUser';
import openBase64Pdf from './utils/openBase64Pdf';
import FilterSection from './FilterSection';
import ShippingActionsMenu from './ShippingActionsMenu';
import ShippingDialogs from './ShippingDialogs';
import ShippingTable from './ShippingTable';

const { UNEXPECTED_ERROR } = generalMessages;

const AdminShippingList = () => {
  const searchParams = useSearchParams();

  const { showSnackbar } = useSnackbar();

  const [isClient, setIsClient] = useState(false);

  const { data, rows, loading, page, limit, refetch } = useShippingList(searchParams);

  const { pricingLists, accounts, canCreateBarcode } = useShippingUser();

  const {
    selectedRow,
    actionIconButton,
    menuOpen,
    deleteOpen,
    packageDialogOpen,
    barcodeDialogOpen,
    barcodeLoading,
    barcodeError,
    openActionsMenu,
    closeActionsMenu,
    openDeleteDialog,
    closeDeleteDialog,
    openPackageDialog,
    closePackageDialog,
    closeBarcodeDialog,
    startBarcodeLoading,
    finishBarcodeLoading,
    setBarcodeFailure,
    clearBarcodeError,
  } = useShippingActions();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCreateBarcode = async (account: Partial<CarrierAccountTypes.ICarrierAccount>) => {
    const shippingId = selectedRow?._id;

    if (!shippingId || !account.carrier || !account.accountNumber || !account._id) {
      return;
    }

    closeActionsMenu();
    startBarcodeLoading();

    try {
      const response = await createBarcode({
        customInfo: account.customInfo,
        hasCustomInfo: !!account.hasCustomInfo,
        displayName: account.displayName!,
        shippingId,
        firm: account.carrier as Carrier,
        accountNumber: account.accountNumber,
        carrierAccountId: account._id.toString(),
      });

      if (response.status === 'OK') {
        await refetch();
        return;
      }
      setBarcodeFailure(response.message || 'Barkod oluşturulamadı');
    } catch {
      setBarcodeFailure('Sistem hatası oluştu');
    } finally {
      finishBarcodeLoading();
    }
  };

  const handleDownloadPaper = async (type: 'labels' | 'invoices') => {
    const shippingId = selectedRow?._id;

    closeActionsMenu();

    if (!shippingId) return;

    try {
      const response = await getPaper({
        shippingId,
        type,
      });

      if (response.status !== 'OK' || !response.data?.file) {
        showSnackbar(response.message ?? 'Evrak indirilirken bir hata oluştu.', 'error');

        return;
      }

      openBase64Pdf(response.data.file);
    } catch (error) {
      console.error(error);

      showSnackbar(UNEXPECTED_ERROR, 'error');
    }
  };

  if (!isClient) return null;

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Wrapper>
        <TableHeader title="Gönderiler" subTitle="Tüm kullanıcılara ait gönderilerin detayları ve güncel durum bilgileri." stacked>
          <FilterSection searchParams={searchParams} />
        </TableHeader>

        <ShippingTable
          rows={rows}
          totalCount={data?.totalCount}
          loading={loading}
          page={page}
          limit={limit}
          searchParams={searchParams}
          onOpenActions={openActionsMenu}
        />

        <ShippingActionsMenu
          anchorEl={actionIconButton}
          open={menuOpen}
          selectedRow={selectedRow}
          accounts={accounts}
          pricingLists={pricingLists}
          canCreateBarcode={canCreateBarcode}
          onClose={closeActionsMenu}
          onOpenDelete={openDeleteDialog}
          onOpenPackage={openPackageDialog}
          onCreateBarcode={handleCreateBarcode}
          onDownloadPaper={handleDownloadPaper}
        />

        <ShippingDialogs
          selectedRow={selectedRow}
          packageDialogOpen={packageDialogOpen}
          onClosePackageDialog={closePackageDialog}
          onPackageSuccess={refetch}
          barcodeDialogOpen={barcodeDialogOpen}
          barcodeLoading={barcodeLoading}
          barcodeError={barcodeError}
          onCloseBarcodeDialog={closeBarcodeDialog}
          onClearBarcodeError={clearBarcodeError}
          deleteOpen={deleteOpen}
          deleteAnchorEl={actionIconButton}
          onCloseDeleteDialog={closeDeleteDialog}
          onDeleteSuccess={() => {
            closeDeleteDialog();
            refetch();
          }}
          showSnackbar={showSnackbar}
        />
      </Wrapper>
    </LocalizationProvider>
  );
};

export default AdminShippingList;
