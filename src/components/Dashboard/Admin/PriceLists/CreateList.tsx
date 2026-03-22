import React, { useMemo, useState, useTransition } from 'react';

import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Stack, TextField, useTheme } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Controller, useForm } from 'react-hook-form';

import createPricingList from '@/app/actions/admin/createPricingList';
import { messages } from '@/constants';
import { buildPricingMatrix } from '@/lib/buildPricingMatrix';

type CreateListProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

const { GENERAL, PRICINGLIST } = messages;

const CreateList = ({ open, onClose, onSuccess }: CreateListProps) => {
  const theme = useTheme();
  const [pending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const matrix = useMemo(() => buildPricingMatrix(9), []);
  const [rows, setRows] = useState([matrix.createEmptyRow(), matrix.createThanRow()]);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ICreatePricingListPayload>({
    defaultValues: {
      name: '',
      zone: [],
    },
  });

  const addRow = () => {
    setRows(prev => {
      const thanRow = prev.find(r => r.id === 'than');
      const others = prev.filter(r => r.id !== 'than');

      return [...others, matrix.createEmptyRow(), thanRow!];
    });
  };

  const removeLastRow = () => {
    setRows(prev => {
      const thanRow = prev.find(r => r.id === 'than');
      const others = prev.filter(r => r.id !== 'than');

      if (others.length <= 1) return prev;

      const updated = others.slice(0, -1);

      return [...updated, thanRow!];
    });
  };

  const onSubmit = (data: ICreatePricingListPayload) => {
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const zones = matrix.rowsToZones(rows);

        const res = await createPricingList({
          ...data,
          zone: zones,
        });

        if (res.status === 'ERROR') {
          setErrorMessage(res.message ?? GENERAL.UNEXPECTED_ERROR);
          return;
        }

        setSnackbar({
          open: true,
          message: res.message ?? PRICINGLIST.SUCCESS,
          severity: 'success',
        });

        onSuccess?.();
        reset();
      } catch (error) {
        console.error('Create pricing list failed:', error);
        setErrorMessage(GENERAL.UNEXPECTED_ERROR);
      }
    });
  };

  const handleClose = () => {
    setRows([matrix.createEmptyRow(), matrix.createThanRow()]);
    setErrorMessage(null);
    onClose?.();
    reset();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            backgroundImage: 'none',
            backgroundColor: theme.palette.dashboard.sidebar,
          },
        }}
      >
        <DialogTitle>Fiyat Listesi Oluştur</DialogTitle>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <DialogContent>
          <Stack marginTop={1} spacing={2} component="form" onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="name"
              control={control}
              rules={{
                required: PRICINGLIST.NAME.REQUIRED,
                minLength: { value: 2, message: PRICINGLIST.NAME.MIN },
                maxLength: { value: 75, message: PRICINGLIST.NAME.MAX },
              }}
              render={({ field }) => <TextField {...field} label="Liste Adı" fullWidth error={!!errors.name} helperText={errors.name?.message} />}
            />

            <Stack direction="row" spacing={2}>
              <Button variant="outlined" onClick={addRow}>
                Ağırlık Satırı Ekle
              </Button>
              <Button variant="outlined" color="error" onClick={removeLastRow}>
                Son Satırı Sil
              </Button>
            </Stack>
            <DataGrid
              rows={rows}
              columns={matrix.columns}
              editMode="cell"
              rowHeight={22}
              hideFooter
              disableColumnMenu
              sx={{
                '& .MuiDataGrid-cell': {
                  fontSize: 12,
                  border: `1px solid ${theme.palette.dashboard.border}`,
                },
                '& .MuiDataGrid-columnHeader': {
                  fontSize: 12,
                },
              }}
              processRowUpdate={newRow => {
                setRows(prev => prev.map(r => (r.id === newRow.id ? newRow : r)));

                return newRow;
              }}
            />

            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={onClose} disabled={pending}>
                İptal
              </Button>

              <Button type="submit" variant="contained" disabled={pending}>
                Oluştur
              </Button>
            </DialogActions>
          </Stack>
        </DialogContent>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CreateList;
