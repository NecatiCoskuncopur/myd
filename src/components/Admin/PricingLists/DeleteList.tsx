'use client';

import deletePricingList from '@/app/actions/admin/deletePricingList';
import { DeleteConfirmPopover } from '@/components';
import { generalMessages, pricingListMessages } from '@/constants';
import { PricingListTypes } from '@/types/pricingList';

type DeleteListProps = {
  open: boolean;
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
  onSuccess?: () => void;
  list: PricingListTypes.IPricingList | null;
};

const DeleteList = ({ open, anchorEl, onClose, onSuccess, list }: DeleteListProps) => {
  if (!list?._id) {
    return null;
  }

  return (
    <DeleteConfirmPopover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      onSuccess={onSuccess}
      title="Fiyat Listesini Sil"
      description={
        <>
          <strong>"{list.name}"</strong> isimli listeyi silmek istediğinize emin misiniz?
        </>
      }
      deleteAction={() => deletePricingList(list._id)}
      successMessage={pricingListMessages.DELETE.SUCCESS}
      errorMessage={generalMessages.UNEXPECTED_ERROR}
    />
  );
};

export default DeleteList;
