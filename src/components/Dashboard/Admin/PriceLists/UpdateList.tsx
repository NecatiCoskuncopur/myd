import React, { useEffect, useMemo, useState, useTransition } from 'react';

import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Snackbar, Stack, TextField, useTheme } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Controller, useForm } from 'react-hook-form';

import updatePricingList from '@/app/actions/admin/updatePricingList';
import { messages } from '@/constants';
import { buildPricingMatrix, GridRow } from '@/lib/buildPricingMatrix';

type UpdateListProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  list: IPricingList | null;
};

const { GENERAL, PRICINGLIST } = messages;

const UpdateList = ({ open, onClose, onSuccess, list }: UpdateListProps) => {
  const theme = useTheme();
  const [pending, startTransition] = useTransition();
  const matrix = useMemo(() => buildPricingMatrix(9), []);

  const [rows, setRows] = useState<GridRow[]>([matrix.createEmptyRow(), matrix.createThanRow()]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
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

  useEffect(() => {
    if (list && list.zone && list.zone.length > 0) {
      reset({ name: list.name });

      const newRows: GridRow[] = [];
      const pricesLength = list.zone[0].prices.length;

      for (let i = 0; i < pricesLength; i++) {
        const row: GridRow = {
          id: i.toString(),
          weight: list.zone[0].prices[i]?.weight ?? 0,
        };

        for (let z = 0; z < list.zone.length; z++) {
          const priceObj = list.zone[z].prices[i];
          row[`zone${z + 1}`] = priceObj?.price ?? null;
        }

        newRows.push(row);
      }

      const lastWeight = list.zone[0].prices[pricesLength - 1]?.weight ?? 0;
      const thanRow: GridRow = {
        id: 'than',
        weight: `>${lastWeight}`,
      };

      for (let z = 0; z < list.zone.length; z++) {
        thanRow[`zone${z + 1}`] = list.zone[z].than ?? null;
      }

      setRows([...newRows, thanRow]);
    }
  }, [list, reset]);

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

        const res = await updatePricingList({
          pricingListId: list?._id ?? '',
          name: data.name,
          zone: zones,
        });

        if (res.status === 'ERROR') {
          setErrorMessage(res.message ?? GENERAL.UNEXPECTED_ERROR);
          return;
        }

        setSnackbar({
          open: true,
          message: res.message ?? PRICINGLIST.UPDATE,
          severity: 'success',
        });

        onSuccess?.();
      } catch (error) {
        console.error('Update pricing list failed:', error);
        setErrorMessage(GENERAL.UNEXPECTED_ERROR);
      }
    });
  };

  const handleClose = () => {
    setRows([matrix.createEmptyRow(), matrix.createThanRow()]);
    setErrorMessage(null);
    reset();
    onClose?.();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { backgroundImage: 'none', backgroundColor: theme.palette.dashboard.sidebar },
        }}
      >
        <DialogTitle>Fiyat Listesini Düzenle</DialogTitle>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <DialogContent>
          <Stack spacing={2} component="form" onSubmit={handleSubmit(onSubmit)} marginTop={1}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => <TextField {...field} label="Liste Adı" fullWidth error={!!errors.name} helperText={errors.name?.message} />}
            />

            <Grid container spacing={3} display="flex">
              <Button variant="outlined" onClick={addRow}>
                Ağırlık Satırı Ekle
              </Button>
              <Button variant="outlined" color="error" onClick={removeLastRow}>
                Son Satırı Sil
              </Button>
            </Grid>

            <DataGrid
              rows={rows}
              columns={matrix.columns}
              editMode="cell"
              rowHeight={22}
              hideFooter
              disableColumnMenu
              sx={{
                '& .MuiDataGrid-cell': { fontSize: 12, border: `1px solid ${theme.palette.dashboard.border}` },
                '& .MuiDataGrid-columnHeader': { fontSize: 12 },
              }}
              processRowUpdate={newRow => {
                setRows(prev => prev.map(r => (r.id === newRow.id ? newRow : r)));
                return newRow;
              }}
            />

            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={handleClose} disabled={pending}>
                İptal
              </Button>
              <Button type="submit" variant="contained" disabled={pending}>
                Güncelle
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

export default UpdateList;
