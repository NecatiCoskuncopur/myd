'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';

import createBarcode from '@/app/actions/shipping/createBarcode';
import getPaper from '@/app/actions/shipping/getPaper';
import { DeleteShipping, TableHeader, Wrapper } from '@/components';
import { Carrier, generalMessages } from '@/constants';
import openBase64Pdf from '@/lib/openBase64Pdf';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { CarrierAccountTypes } from '@/types/carrierAccount';

import BarcodeResultDialog from './BarcodeResultDialog';
import FilterSection from './FilterSection';
import useShippingActions from './hooks/useShippingActions';
import useShippingList from './hooks/useShippingList';
import useShippingUser from './hooks/useShippingUser';
import ShippingActionsMenu from './ShippingActionsMenu';
import ShippingTable from './ShippingTable';

const { UNEXPECTED_ERROR } = generalMessages;

const ShippingList = () => {
  const searchParams = useSearchParams();

  const { showSnackbar } = useSnackbar();

  const { data, rows, loading, page, limit, refetch } = useShippingList(searchParams);

  const { pricingLists, accounts, canCreateBarcode } = useShippingUser();

  const {
    selectedRow,
    actionIconButton,

    menuOpen,
    deleteOpen,

    barcodeDialogOpen,
    barcodeLoading,
    barcodeError,

    openActionsMenu,
    closeActionsMenu,

    openDeleteDialog,
    closeDeleteDialog,

    closeBarcodeDialog,
    startBarcodeLoading,
    finishBarcodeLoading,
    setBarcodeFailure,
    clearBarcodeError,
  } = useShippingActions();

  const handleCreateBarcode = async (account: Partial<CarrierAccountTypes.ICarrierAccount>) => {
    const shippingId = selectedRow?._id;

    if (!shippingId || !account.carrier || !account.accountNumber || !account._id) {
      return;
    }

    closeActionsMenu();
    startBarcodeLoading();

    try {
      const response = await createBarcode({
        hasCustomInfo: !!account.hasCustomInfo,

        customInfo: account.customInfo,

        shippingId,

        displayName: account.displayName!,

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

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Wrapper>
        <TableHeader title="Gönderilerim" subTitle="Gönderilerinize ait tüm detaylar ve güncel durum bilgileri." stacked>
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
          onDelete={openDeleteDialog}
          onCreateBarcode={handleCreateBarcode}
          onDownloadPaper={handleDownloadPaper}
        />

        <BarcodeResultDialog
          open={barcodeDialogOpen}
          loading={barcodeLoading}
          error={barcodeError}
          onClose={closeBarcodeDialog}
          onClearError={clearBarcodeError}
        />

        <DeleteShipping
          id={selectedRow?._id ?? ''}
          open={deleteOpen}
          anchorEl={actionIconButton}
          onClose={closeDeleteDialog}
          onSuccess={() => {
            closeDeleteDialog();
            void refetch();
          }}
        />
      </Wrapper>
    </LocalizationProvider>
  );
};

export default ShippingList;
