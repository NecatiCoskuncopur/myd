import React from 'react';

import { Button, Grid, MenuItem, Stack, TextField, useTheme } from '@mui/material';

import { DataGrid, GridColDef } from '@mui/x-data-grid';

import { Control, Controller, FieldErrors } from 'react-hook-form';

import { CarrierAccountTypeEnum, pricingListMessages } from '@/constants';

import { GridRow } from '@/lib/buildPricingMatrix';

import { PricingListTypes } from '@/types/pricingList';

type PricingListFormPayload = PricingListTypes.ICreatePricingListPayload;

type FormItemsProps = {
  control: Control<PricingListFormPayload>;
  errors: FieldErrors<PricingListFormPayload>;
  rows: GridRow[];
  columns: GridColDef[];
  onAddRow: () => void;
  onRemoveLastRow: () => void;
  onProcessRowUpdate: (newRow: GridRow) => GridRow;
};

const { NAME } = pricingListMessages;

const FormItems = ({ control, errors, rows, columns, onAddRow, onRemoveLastRow, onProcessRowUpdate }: FormItemsProps) => {
  const theme = useTheme();

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="name"
            control={control}
            rules={{
              required: NAME.REQUIRED,
              minLength: {
                value: 2,
                message: NAME.MIN,
              },
              maxLength: {
                value: 75,
                message: NAME.MAX,
              },
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
        <Button variant="outlined" onClick={onAddRow}>
          Ağırlık Satırı Ekle
        </Button>

        <Button variant="outlined" color="error" onClick={onRemoveLastRow}>
          Son Satırı Sil
        </Button>
      </Stack>

      <DataGrid
        rows={rows}
        columns={columns}
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
        processRowUpdate={onProcessRowUpdate}
      />
    </Stack>
  );
};

export default FormItems;
