'use client';

import { useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';

import getAdditionalDocument from '@/app/actions/additionalDocument/getAdditionalDocument';
import getAdditionalDocuments from '@/app/actions/additionalDocument/getAdditionalDocuments';
import cancelShipping from '@/app/actions/admin/cancelShipping';
import printLabel from '@/app/actions/admin/printLabel';
import createBarcode from '@/app/actions/shipping/createBarcode';
import getPaper from '@/app/actions/shipping/getPaper';
import { TableHeader, Wrapper } from '@/components';
import { generalMessages } from '@/constants';
import openBase64File from '@/lib/openBase64File';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { AdditionalDocumentTypes } from '@/types/additionalDocument';
import { CarrierAccountTypes } from '@/types/carrierAccount';
import { ShippingTypes } from '@/types/shipping';

import CancelShippingPopover from './CancelShippingPopover';
import FilterSection from './FilterSection';
import useShippingActions from './hooks/useShippingActions';
import useShippingList from './hooks/useShippingList';
import useShippingUser from './hooks/useShippingUser';
import ShippingActionsMenu from './ShippingActionsMenu';
import ShippingDialogs from './ShippingDialogs';
import ShippingTable from './ShippingTable';

const { UNEXPECTED_ERROR } = generalMessages;

const AdminShippingList = () => {
  const searchParams = useSearchParams();
  const { showSnackbar } = useSnackbar();

  const [additionalDocuments, setAdditionalDocuments] = useState<AdditionalDocumentTypes.IAdditionalDocument[]>([]);

  const actionMenuRequestIdRef = useRef(0);

  const { data, rows, isLoading, page, limit, refetch } = useShippingList(searchParams);

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

    cancelOpen,
    cancelAnchorEl,
    cancelLoading,

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

    openCancelPopover,
    closeCancelPopover,
    startCancelLoading,
    finishCancelLoading,
  } = useShippingActions();

  const handleOpenActionsMenu = (row: ShippingTypes.IShipping, anchorEl: HTMLButtonElement) => {
    const requestId = ++actionMenuRequestIdRef.current;

    setAdditionalDocuments([]);

    void (async () => {
      try {
        const response = await getAdditionalDocuments(row._id);

        if (requestId !== actionMenuRequestIdRef.current) {
          return;
        }

        if (response.status === 'OK') {
          setAdditionalDocuments(response.data ?? []);
        } else {
          setAdditionalDocuments([]);
        }
      } catch {
        if (requestId !== actionMenuRequestIdRef.current) {
          return;
        }

        setAdditionalDocuments([]);
      }

      if (requestId !== actionMenuRequestIdRef.current) {
        return;
      }

      openActionsMenu(row, anchorEl);
    })();
  };

  const handleCreateBarcode = async (account: Partial<CarrierAccountTypes.ICarrierAccount>) => {
    const shippingId = selectedRow?._id;

    if (!shippingId || !account.carrier || !account.accountNumber || !account._id || !account.displayName) {
      return;
    }

    closeActionsMenu();
    startBarcodeLoading();

    try {
      const response = await createBarcode({
        displayName: account.displayName,
        shippingId,
        firm: account.carrier,
        accountNumber: account.accountNumber,
        carrierAccountId: account._id.toString(),
      });

      if (response.status !== 'OK') {
        setBarcodeFailure(response.message ?? 'Barkod oluşturulamadı.');

        return;
      }

      await refetch();
    } catch (error) {
      setBarcodeFailure(error instanceof Error ? error.message : UNEXPECTED_ERROR);
    } finally {
      finishBarcodeLoading();
    }
  };

  const handleDownloadPaper = async (type: 'labels' | 'invoices') => {
    const shippingId = selectedRow?._id;

    if (!shippingId) {
      return;
    }

    closeActionsMenu();

    try {
      const response = await getPaper({
        shippingId,
        type,
      });

      if (response.status !== 'OK' || !response.data?.file) {
        showSnackbar(response.message ?? 'Evrak indirilirken bir hata oluştu.', 'error');

        return;
      }

      openBase64File(response.data.file, 'application/pdf');
    } catch {
      showSnackbar(UNEXPECTED_ERROR, 'error');
    }
  };

  const handleDownloadAdditionalDocument = async (additionalDocumentId: string) => {
    try {
      const response = await getAdditionalDocument(additionalDocumentId);

      if (response.status !== 'OK' || !response.data?.file || !response.data?.contentType) {
        showSnackbar(response.message ?? 'Belge alınırken bir hata oluştu.', 'error');

        return;
      }

      openBase64File(response.data.file, response.data.contentType);
    } catch {
      showSnackbar(UNEXPECTED_ERROR, 'error');
    }
  };

  const handlePrintLabel = async (shippingId: string) => {
    try {
      const response = await printLabel(shippingId);

      if (response.status !== 'OK') {
        showSnackbar(response.message ?? 'Barkod yazdırılamadı.', 'error');

        return;
      }

      showSnackbar('Barkod yazdırma işlemi gönderildi.', 'success');
    } catch {
      showSnackbar(UNEXPECTED_ERROR, 'error');
    }
  };

  const handleCancelShipping = async () => {
    const shippingId = selectedRow?._id;
    const trackingNumber = selectedRow?.carrier?.trackingNumber;
    const accountNumber = selectedRow?.carrier?.account;
    const firm = selectedRow?.carrier?.name;

    if (!shippingId || !trackingNumber || !accountNumber || !firm) {
      showSnackbar('Gönderi bilgileri eksik.', 'error');

      return;
    }

    const carrierAccount = accounts.find(account => account.carrier === firm && account.accountNumber === accountNumber);

    if (!carrierAccount?._id) {
      showSnackbar('Gönderiye ait kargo hesabı bulunamadı.', 'error');

      return;
    }

    startCancelLoading();

    try {
      const response = await cancelShipping({
        shippingId,
        trackingNumber,
        accountNumber,
        carrierAccountId: carrierAccount._id.toString(),
      });

      if (response.status !== 'OK') {
        showSnackbar(response.message ?? 'Gönderi iptal edilemedi.', 'error');

        return;
      }

      showSnackbar('Gönderi başarıyla iptal edildi.', 'success');

      closeCancelPopover();

      await refetch();
    } catch {
      showSnackbar(UNEXPECTED_ERROR, 'error');
    } finally {
      finishCancelLoading();
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Wrapper>
        <TableHeader title="Gönderiler" subTitle="Tüm kullanıcılara ait gönderilerin detayları ve güncel durum bilgileri." stacked>
          <FilterSection searchParams={searchParams} />
        </TableHeader>

        <ShippingTable
          rows={rows}
          totalCount={data?.totalCount ?? 0}
          loading={isLoading}
          page={page}
          limit={limit}
          searchParams={searchParams}
          onOpenActions={handleOpenActionsMenu}
          onPrintLabel={handlePrintLabel}
        />

        <ShippingActionsMenu
          anchorEl={actionIconButton}
          open={menuOpen}
          selectedRow={selectedRow}
          accounts={accounts}
          pricingLists={pricingLists}
          canCreateBarcode={canCreateBarcode}
          additionalDocuments={additionalDocuments}
          onClose={closeActionsMenu}
          onOpenDelete={openDeleteDialog}
          onOpenPackage={openPackageDialog}
          onOpenCancel={openCancelPopover}
          onCreateBarcode={handleCreateBarcode}
          onDownloadPaper={handleDownloadPaper}
          onDownloadAdditionalDocument={handleDownloadAdditionalDocument}
        />

        <CancelShippingPopover
          open={cancelOpen}
          anchorEl={cancelAnchorEl}
          shipping={selectedRow}
          loading={cancelLoading}
          onClose={closeCancelPopover}
          onConfirm={handleCancelShipping}
        />

        <ShippingDialogs
          selectedRow={selectedRow}
          packageDialogOpen={packageDialogOpen}
          onClosePackageDialog={closePackageDialog}
          onPackageSuccess={() => {
            void refetch();
          }}
          barcodeDialogOpen={barcodeDialogOpen}
          barcodeLoading={barcodeLoading}
          barcodeError={barcodeError}
          onCloseBarcodeDialog={closeBarcodeDialog}
          deleteOpen={deleteOpen}
          deleteAnchorEl={actionIconButton}
          onCloseDeleteDialog={closeDeleteDialog}
          onDeleteSuccess={() => {
            closeDeleteDialog();
            void refetch();
          }}
          showSnackbar={showSnackbar}
        />
      </Wrapper>
    </LocalizationProvider>
  );
};

export default AdminShippingList;
