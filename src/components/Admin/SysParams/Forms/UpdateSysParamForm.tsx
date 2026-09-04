'use client';

import { useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useForm } from 'react-hook-form';

import updateSysParam from '@/app/actions/sysParam/updateSysParam';
import { StyledButton } from '@/components';
import { generalMessages, sysParamMessages } from '@/constants';
import { useSnackbar } from '@/providers/SnackbarProvider';

import FormItems from './FormItems';

type UpdateSysParamFormProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  param: SysParamTypes.ISysParam | null;
};

const { UPDATE } = sysParamMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const UpdateSysParamForm = ({ open, onClose, onSuccess, param }: UpdateSysParamFormProps) => {
  const { showSnackbar } = useSnackbar();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SysParamTypes.IUpdateSysParamPayload>();

  useEffect(() => {
    if (!param || !open) {
      return;
    }

    reset({
      paramId: param._id,
      key: param.key,
      value: param.value,
    });
  }, [param, open, reset]);

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    reset();
    onClose();
  };

  const onSubmit = async (data: SysParamTypes.IUpdateSysParamPayload) => {
    try {
      const response = await updateSysParam(data);

      if (response.status === 'ERROR') {
        showSnackbar(response.message ?? UNEXPECTED_ERROR, 'error');

        return;
      }

      showSnackbar(response.message ?? UPDATE.SUCCESS, 'success');

      reset();

      onSuccess?.();
      onClose();
    } catch {
      showSnackbar(UNEXPECTED_ERROR, 'error');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: theme => ({
            backgroundImage: 'none',
            backgroundColor: theme.palette.dashboard.sidebar,
          }),
        },
      }}
    >
      <DialogTitle>Sistem Parametresini Düzenle</DialogTitle>

      <DialogContent>
        <FormItems control={control} errors={errors} />
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
        }}
      >
        <Button type="button" onClick={handleClose} color="inherit" disabled={isSubmitting}>
          İptal
        </Button>

        <StyledButton type="button" onClick={handleSubmit(onSubmit)} variant="contained" loading={isSubmitting} disabled={isSubmitting}>
          Güncelle
        </StyledButton>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateSysParamForm;
