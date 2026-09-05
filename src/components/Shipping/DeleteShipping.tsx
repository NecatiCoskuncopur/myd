'use client';

import deleteShipping from '@/app/actions/shipping/deleteShipping';
import DeleteConfirmPopover from '@/components/DeleteConfirmPopover';
import { shippingMessages } from '@/constants';

type DeleteShippingProps = {
  open: boolean;
  id: string;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onSuccess?: () => void;
};

const DeleteShipping = ({ open, id, anchorEl, onClose, onSuccess }: DeleteShippingProps) => {
  return (
    <DeleteConfirmPopover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      onSuccess={onSuccess}
      title="Gönderiyi Sil?"
      description="Bu gönderiyi silmek istediğinize emin misiniz?"
      deleteAction={() => deleteShipping(id)}
      successMessage={shippingMessages.DELETE.SUCCESS}
      errorMessage={shippingMessages.DELETE.ERROR}
      cancelText="Vazgeç"
    />
  );
};

export default DeleteShipping;
