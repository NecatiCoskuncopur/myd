import React, { useMemo, useState, useTransition } from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Stack, TextField, useTheme } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Controller, useForm } from 'react-hook-form';

import createPricingList from '@/app/actions/admin/createPricingList';
import StyledButton from '@/components/StyledButton';
import { CarrierAccountTypeEnum, generalMessages, pricingListMessages } from '@/constants';
import { buildPricingMatrix } from '@/lib/buildPricingMatrix';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { PricingListTypes } from '@/types/pricingList';

type CreateListProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

const { NAME, SUCCESS } = pricingListMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const CreateList = ({ open, onClose, onSuccess }: CreateListProps) => {
  const theme = useTheme();
  const [pending, startTransition] = useTransition();
  const matrix = useMemo(() => buildPricingMatrix(9), []);
  const [rows, setRows] = useState([matrix.createEmptyRow(), matrix.createThanRow()]);

  const { showSnackbar } = useSnackbar();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PricingListTypes.ICreatePricingListPayload>({
    defaultValues: {
      name: '',
      listType: CarrierAccountTypeEnum.ECONOMY,
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

  const onSubmit = (data: PricingListTypes.ICreatePricingListPayload) => {
    startTransition(async () => {
      const zones = matrix.rowsToZones(rows);

      const response = await createPricingList({
        ...data,
        zone: zones,
      });

      if (response.status === 'ERROR') {
        showSnackbar(response.message ?? UNEXPECTED_ERROR, 'error');
        return;
      }

      showSnackbar(response.message ?? SUCCESS, 'success');

      reset();
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
            sx: {
              backgroundImage: 'none',
              backgroundColor: theme.palette.dashboard.sidebar,
            },
          },
        }}
      >
        <DialogTitle>Fiyat Listesi Oluştur</DialogTitle>

        <DialogContent>
          <Stack sx={{ marginTop: 1 }} spacing={2}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="name"
                  control={control}
                  rules={{
                    required: NAME.REQUIRED,
                    minLength: { value: 2, message: NAME.MIN },
                    maxLength: { value: 75, message: NAME.MAX },
                  }}
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
              onProcessRowUpdateError={error => {
                console.error(error);
              }}
              processRowUpdate={newRow => {
                setRows(prev => prev.map(r => (r.id === newRow.id ? newRow : r)));

                return newRow;
              }}
            />

            <DialogActions sx={{ px: 0, pb: 0 }}>
              <Button onClick={handleClose} disabled={pending}>
                İptal
              </Button>

              <StyledButton type="button" onClick={handleSubmit(onSubmit)} variant="contained" disabled={pending}>
                Oluştur
              </StyledButton>
            </DialogActions>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateList;
