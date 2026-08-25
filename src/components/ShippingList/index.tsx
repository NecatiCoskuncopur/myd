'use client';

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
import { PricingListTypes } from '@/types/pricingList';

import BarcodeResultDialog from './BarcodeResultDialog';
import FilterSection from './FilterSection';
import useShippingActions from './hooks/useShippingActions';
import useShippingList from './hooks/useShippingList';
import ShippingActionsMenu from './ShippingActionsMenu';
import ShippingTable from './ShippingTable';

const { UNEXPECTED_ERROR } = generalMessages;

type ShippingListProps = {
  accounts: CarrierAccountTypes.BarcodeCarrierAccount[];
  pricingLists: Record<string, PricingListTypes.IPricingList>;
  canCreateBarcode: boolean;
};

const ShippingList = ({ accounts, pricingLists, canCreateBarcode }: ShippingListProps) => {
  const searchParams = useSearchParams();
  const { showSnackbar } = useSnackbar();

  const { rows, totalCount, isLoading, page, limit, refetch } = useShippingList(searchParams);

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
        hasCustomInfo: Boolean(account.hasCustomInfo),
        customInfo: account.customInfo,
      });

      if (response.status === 'ERROR') {
        setBarcodeFailure(response.message || 'Barkod oluşturulamadı.');
        return;
      }

      await refetch();
    } catch {
      setBarcodeFailure(UNEXPECTED_ERROR);
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

      openBase64Pdf(response.data.file);
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

        <ShippingTable
          rows={rows}
          totalCount={totalCount}
          loading={isLoading}
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

        <BarcodeResultDialog open={barcodeDialogOpen} loading={barcodeLoading} error={barcodeError} onClose={closeBarcodeDialog} />

        <DeleteShipping id={selectedRow?._id ?? ''} open={deleteOpen} anchorEl={actionIconButton} onClose={closeDeleteDialog} onSuccess={handleDeleteSuccess} />
      </Wrapper>
    </LocalizationProvider>
  );
};

export default ShippingList;
