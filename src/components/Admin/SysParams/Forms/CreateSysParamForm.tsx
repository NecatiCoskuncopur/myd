'use client';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useForm } from 'react-hook-form';

import createSysParam from '@/app/actions/sysParam/createSysParam';
import { StyledButton } from '@/components';
import { generalMessages, sysParamMessages } from '@/constants';
import { useSnackbar } from '@/providers/SnackbarProvider';

import FormItems from './FormItems';

type CreateSysParamFormProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

const { CREATE } = sysParamMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const CreateSysParamForm = ({ open, onClose, onSuccess }: CreateSysParamFormProps) => {
  const { showSnackbar } = useSnackbar();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SysParamTypes.ICreateSysParamPayload>({
    defaultValues: {
      key: '',
      value: '',
    },
  });

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    reset();
    onClose();
  };

  const onSubmit = async (data: SysParamTypes.ICreateSysParamPayload) => {
    try {
      const response = await createSysParam(data);

      if (response.status === 'ERROR') {
        showSnackbar(response.message ?? UNEXPECTED_ERROR, 'error');

        return;
      }

      showSnackbar(response.message ?? CREATE.SUCCESS, 'success');

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
      <DialogTitle>Sistem Parametresi Oluştur</DialogTitle>

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
          Kaydet
        </StyledButton>
      </DialogActions>
    </Dialog>
  );
};

export default CreateSysParamForm;
