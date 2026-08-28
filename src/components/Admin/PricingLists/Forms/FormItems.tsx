import { Box, Button, Grid, MenuItem, Stack, TextField } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import type { ClipboardEvent } from 'react';
import type { Control, FieldErrors } from 'react-hook-form';
import { Controller } from 'react-hook-form';

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
  onPastePrices: (text: string) => void;
};

const { NAME } = pricingListMessages;

const FormItems = ({ control, errors, rows, columns, onAddRow, onRemoveLastRow, onProcessRowUpdate, onPastePrices }: FormItemsProps) => {
  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    const text = event.clipboardData.getData('text/plain');

    if (!text.includes('\t') && !text.includes('\n')) {
      return;
    }

    event.preventDefault();

    onPastePrices(text);
  };

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      <Grid container spacing={2}>
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
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
            render={({ field }) => (
              <TextField {...field} label="Liste Adı" fullWidth value={field.value ?? ''} error={!!errors.name} helperText={errors.name?.message} />
            )}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <Controller
            name="listType"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                fullWidth
                label="Liste Tipi"
                value={field.value ?? ''}
                error={!!errors.listType}
                helperText={errors.listType?.message}
              >
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
        <Button type="button" variant="outlined" onClick={onAddRow}>
          Ağırlık Satırı Ekle
        </Button>

        <Button type="button" variant="outlined" color="error" onClick={onRemoveLastRow}>
          Son Satırı Sil
        </Button>
      </Stack>

      <Box onPaste={handlePaste}>
        <DataGrid
          rows={rows}
          columns={columns}
          editMode="cell"
          rowHeight={22}
          hideFooter
          disableColumnMenu
          processRowUpdate={onProcessRowUpdate}
          sx={theme => ({
            '& .MuiDataGrid-cell': {
              fontSize: 12,
              border: `1px solid ${theme.palette.dashboard.border}`,
            },
            '& .MuiDataGrid-columnHeader': {
              fontSize: 12,
            },
          })}
        />
      </Box>
    </Stack>
  );
};

export default FormItems;
