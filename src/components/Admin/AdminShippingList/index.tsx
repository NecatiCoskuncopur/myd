'use client';

import { useSearchParams } from 'next/navigation';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';

import printLabel from '@/app/actions/admin/printLabel';
import createBarcode from '@/app/actions/shipping/createBarcode';
import getPaper from '@/app/actions/shipping/getPaper';
import { TableHeader, Wrapper } from '@/components';
import { generalMessages } from '@/constants';
import openBase64Pdf from '@/lib/openBase64Pdf';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { CarrierAccountTypes } from '@/types/carrierAccount';

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
  } = useShippingActions();

  const handleCreateBarcode = async (account: Partial<CarrierAccountTypes.ICarrierAccount>) => {
    const shippingId = selectedRow?._id;

    if (!shippingId || !account.carrier || !account.accountNumber || !account._id || !account.displayName) {
      return;
    }

    closeActionsMenu();
    startBarcodeLoading();

    try {
      const response = await createBarcode({
        customInfo: account.customInfo,
        hasCustomInfo: Boolean(account.hasCustomInfo),
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
          onOpenActions={openActionsMenu}
          onPrintLabel={handlePrintLabel}
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
