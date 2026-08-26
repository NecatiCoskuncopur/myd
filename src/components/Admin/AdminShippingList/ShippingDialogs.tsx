'use client';

import { DeleteShipping } from '@/components';
import { ShippingTypes } from '@/types/shipping';

import BarcodeResultDialog from './BarcodeResultDialog';
import PackageDimensionsDialog from './PackageDimensionDialog';

interface ShippingDialogsProps {
  selectedRow: ShippingTypes.IShipping | null;

  packageDialogOpen: boolean;
  onClosePackageDialog: () => void;
  onPackageSuccess: () => void;

  barcodeDialogOpen: boolean;
  barcodeLoading: boolean;
  barcodeError: string | null;
  onCloseBarcodeDialog: () => void;

  deleteOpen: boolean;
  deleteAnchorEl: HTMLButtonElement | null;
  onCloseDeleteDialog: () => void;
  onDeleteSuccess: () => void;

  showSnackbar: (message: string, severity: 'success' | 'error' | 'warning' | 'info') => void;
}

const ShippingDialogs = ({
  selectedRow,
  packageDialogOpen,
  onClosePackageDialog,
  onPackageSuccess,
  barcodeDialogOpen,
  barcodeLoading,
  barcodeError,
  onCloseBarcodeDialog,
  deleteOpen,
  deleteAnchorEl,
  onCloseDeleteDialog,
  onDeleteSuccess,
  showSnackbar,
}: ShippingDialogsProps) => {
  return (
    <>
      <BarcodeResultDialog open={barcodeDialogOpen} loading={barcodeLoading} error={barcodeError} onClose={onCloseBarcodeDialog} />

      <PackageDimensionsDialog
        open={packageDialogOpen}
        shipping={selectedRow}
        onClose={onClosePackageDialog}
        onSuccess={onPackageSuccess}
        showSnackbar={showSnackbar}
      />

      <DeleteShipping id={selectedRow?._id ?? ''} open={deleteOpen} anchorEl={deleteAnchorEl} onClose={onCloseDeleteDialog} onSuccess={onDeleteSuccess} />
    </>
  );
};

export default ShippingDialogs;
