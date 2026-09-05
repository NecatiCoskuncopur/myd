'use client';

import deleteSysParam from '@/app/actions/sysParam/deleteSysParam';
import DeleteConfirmPopover from '@/components/DeleteConfirmPopover';
import { generalMessages, sysParamMessages } from '@/constants';

type DeleteParamProps = {
  open: boolean;
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
  onSuccess?: () => void;
  param: SysParamTypes.ISysParam | null;
};

const DeleteSysParam = ({ open, anchorEl, onClose, onSuccess, param }: DeleteParamProps) => {
  if (!param?._id) {
    return null;
  }

  return (
    <DeleteConfirmPopover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      onSuccess={onSuccess}
      title="Sistem Parametresini Sil"
      description={
        <>
          <strong>"{param.key}"</strong> anahtarını silmek istediğinize emin misiniz?
        </>
      }
      deleteAction={() => deleteSysParam(param._id)}
      successMessage={sysParamMessages.DELETE.SUCCESS}
      errorMessage={generalMessages.UNEXPECTED_ERROR}
    />
  );
};

export default DeleteSysParam;
