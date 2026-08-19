import React, { useEffect, useMemo, useState, useTransition } from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Stack, TextField, useTheme } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Controller, useForm } from 'react-hook-form';

import updatePricingList from '@/app/actions/admin/updatePricingList';
import StyledButton from '@/components/StyledButton';
import { CarrierAccountTypeEnum, generalMessages, pricingListMessages } from '@/constants';
import { buildPricingMatrix, GridRow } from '@/lib/buildPricingMatrix';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { PricingListTypes } from '@/types/pricingList';

type UpdateListProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  list: PricingListTypes.IPricingList | null;
};

const { UPDATE } = pricingListMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const UpdateList = ({ open, onClose, onSuccess, list }: UpdateListProps) => {
  const theme = useTheme();
  const [pending, startTransition] = useTransition();
  const matrix = useMemo(() => buildPricingMatrix(9), []);

  const [rows, setRows] = useState<GridRow[]>([matrix.createEmptyRow(), matrix.createThanRow()]);

  const { showSnackbar } = useSnackbar();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PricingListTypes.ICreatePricingListPayload>({
    defaultValues: {
      name: '',
      zone: [],
    },
  });

  useEffect(() => {
    if (!list || list.zone.length === 0) {
      return;
    }

    reset({
      name: list.name,
      listType: list.listType,
    });

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

  const onSubmit = (data: PricingListTypes.ICreatePricingListPayload) => {
    if (!list) return;
    startTransition(async () => {
      const zones = matrix.rowsToZones(rows);

      const response = await updatePricingList({
        pricingListId: list?._id,
        name: data.name,
        listType: data.listType,
        zone: zones,
      });

      if (response.status === 'ERROR') {
        showSnackbar(response.message ?? UNEXPECTED_ERROR, 'error');
        return;
      }

      showSnackbar(response.message ?? UPDATE, 'success');

      onSuccess?.();
      handleClose();
    });
  };

  const handleClose = () => {
    reset();
    setRows([matrix.createEmptyRow(), matrix.createThanRow()]);
    onClose?.();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        slotProps={{
          paper: {
            sx: { backgroundImage: 'none', backgroundColor: theme.palette.dashboard.sidebar },
          },
        }}
      >
        <DialogTitle>Fiyat Listesini Düzenle</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => <TextField {...field} label="Liste Adı" fullWidth error={!!errors.name} helperText={errors.name?.message} />}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="listType"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select fullWidth label="Liste Tipi" error={!!errors.listType} helperText={errors.listType?.message}>
                      {Object.values(CarrierAccountTypeEnum).map(accountType => (
                        <MenuItem key={accountType} value={accountType}>
                          {accountType}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ display: 'flex' }}>
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
              onProcessRowUpdateError={error => console.error(error)}
              processRowUpdate={newRow => {
                setRows(prev => prev.map(r => (r.id === newRow.id ? newRow : r)));
                return newRow;
              }}
            />

            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={handleClose} disabled={pending}>
                İptal
              </Button>
              <StyledButton type="button" onClick={handleSubmit(onSubmit)} variant="contained" disabled={pending}>
                Güncelle
              </StyledButton>
            </DialogActions>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UpdateList;
