'use client';

import { useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';

import getAdditionalDocument from '@/app/actions/additionalDocument/getAdditionalDocument';
import getAdditionalDocuments from '@/app/actions/additionalDocument/getAdditionalDocuments';
import createBarcode from '@/app/actions/shipping/createBarcode';
import getPaper from '@/app/actions/shipping/getPaper';
import { BulkBarcode, DeleteShipping, TableHeader, Wrapper } from '@/components';
import { Carrier, generalMessages } from '@/constants';
import openBase64File from '@/lib/openBase64File';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { AdditionalDocumentTypes } from '@/types/additionalDocument';
import { CarrierAccountTypes } from '@/types/carrierAccount';
import { PricingListTypes } from '@/types/pricingList';
import { ShippingTypes } from '@/types/shipping';

import BarcodeResultDialog from './BarcodeResultDialog';
import FilterSection from './FilterSection';
import useShippingActions from './hooks/useShippingActions';
import useShippingList from './hooks/useShippingList';
import ShippingActionsMenu from './ShippingActionsMenu';
import ShippingTable from './ShippingTable';

const { UNEXPECTED_ERROR } = generalMessages;

type ShippingListProps = {
  accounts: CarrierAccountTypes.IUserPermittedAccount[];
  pricingLists: Record<string, PricingListTypes.IPricingList>;
  canCreateBarcode: boolean;
};

const ShippingList = ({ accounts, pricingLists, canCreateBarcode }: ShippingListProps) => {
  const searchParams = useSearchParams();
  const { showSnackbar } = useSnackbar();

  const [additionalDocuments, setAdditionalDocuments] = useState<AdditionalDocumentTypes.IAdditionalDocument[]>([]);
  const [selectedShippingIds, setSelectedShippingIds] = useState<string[]>([]);
  const actionMenuRequestIdRef = useRef(0);

  const { rows, totalCount, isLoading, page, limit, refetch } = useShippingList(searchParams);

  const selectedShippings = useMemo(() => rows.filter(shipping => selectedShippingIds.includes(shipping._id)), [rows, selectedShippingIds]);

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
  } = useShippingActions();

  const handleOpenActionsMenu = (row: ShippingTypes.IShipping, anchorEl: HTMLElement) => {
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

    if (!shippingId || !account._id || !account.carrier || !account.accountNumber || !account.displayName) {
      return;
    }

    closeActionsMenu();
    startBarcodeLoading();

    try {
      const response = await createBarcode({
        shippingId,
        carrierAccountId: account._id.toString(),
        firm: account.carrier as Carrier,
        accountNumber: account.accountNumber,
        displayName: account.displayName,
      });

      if (response.status === 'ERROR') {
        setBarcodeFailure(response.message || 'Barkod oluşturulamadı.');

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

  const handleDeleteSuccess = () => {
    closeDeleteDialog();
    void refetch();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Wrapper>
        <TableHeader title="Gönderilerim" subTitle="Gönderilerinize ait tüm detaylar ve güncel durum bilgileri." stacked>
          <FilterSection searchParams={searchParams} />
        </TableHeader>
        {canCreateBarcode && <BulkBarcode shippings={selectedShippings} accounts={accounts} onSelectionChange={setSelectedShippingIds} onComplete={refetch} />}
        <ShippingTable
          rows={rows}
          totalCount={totalCount}
          loading={isLoading}
          page={page}
          limit={limit}
          searchParams={searchParams}
          onOpenActions={handleOpenActionsMenu}
          selectedShippingIds={selectedShippingIds}
          setSelectedShippingIds={setSelectedShippingIds}
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
          onDelete={openDeleteDialog}
          onCreateBarcode={handleCreateBarcode}
          onDownloadPaper={handleDownloadPaper}
          onDownloadAdditionalDocument={handleDownloadAdditionalDocument}
        />

        <BarcodeResultDialog open={barcodeDialogOpen} loading={barcodeLoading} error={barcodeError} onClose={closeBarcodeDialog} />

        <DeleteShipping id={selectedRow?._id ?? ''} open={deleteOpen} anchorEl={actionIconButton} onClose={closeDeleteDialog} onSuccess={handleDeleteSuccess} />
      </Wrapper>
    </LocalizationProvider>
  );
};

export default ShippingList;
