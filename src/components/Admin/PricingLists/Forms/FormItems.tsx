import { useState } from 'react';
import { Box, Button, Grid, InputAdornment, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
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
  onBulkPriceUpdate: (operation: 'increase' | 'decrease', type: 'amount' | 'percentage', value: number) => void;
};

const { NAME } = pricingListMessages;

const FormItems = ({ control, errors, rows, columns, onAddRow, onRemoveLastRow, onProcessRowUpdate, onPastePrices, onBulkPriceUpdate }: FormItemsProps) => {
  const [bulkValue, setBulkValue] = useState<string>('');
  const [bulkType, setBulkType] = useState<'amount' | 'percentage'>('amount');
  const [bulkOperation, setBulkOperation] = useState<'increase' | 'decrease'>('increase');

  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    const text = event.clipboardData.getData('text/plain');
    if (!text.includes('\t') && !text.includes('\n')) return;
    event.preventDefault();
    onPastePrices(text);
  };

  const handleApplyBulk = () => {
    const numericValue = parseFloat(bulkValue);
    if (!isNaN(numericValue) && numericValue > 0) {
      onBulkPriceUpdate(bulkOperation, bulkType, numericValue);
      setBulkValue('');
    }
  };

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
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
            render={({ field }) => (
              <TextField {...field} label="Liste Adı" fullWidth value={field.value ?? ''} error={!!errors.name} helperText={errors.name?.message} />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
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

      <Stack sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }} direction="row" spacing={2} useFlexGap>
        <Stack direction="row" spacing={2}>
          <Button type="button" variant="outlined" onClick={onAddRow}>
            Ağırlık Satırı Ekle
          </Button>
          <Button type="button" variant="outlined" color="error" onClick={onRemoveLastRow}>
            Son Satırı Sil
          </Button>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Toplu İşlem:
          </Typography>

          {/* YENİ: Artır / Azalt Seçimi */}
          <Select size="small" value={bulkOperation} onChange={e => setBulkOperation(e.target.value as 'increase' | 'decrease')} sx={{ width: 100 }}>
            <MenuItem value="increase">Artır</MenuItem>
            <MenuItem value="decrease">Azalt</MenuItem>
          </Select>

          <TextField
            size="small"
            type="number"
            placeholder="Değer"
            value={bulkValue}
            onChange={e => setBulkValue(e.target.value)}
            sx={{ width: 180 }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Select
                      variant="standard"
                      value={bulkType}
                      onChange={e => setBulkType(e.target.value as 'amount' | 'percentage')}
                      disableUnderline
                      sx={{ ml: 1, '& .MuiSelect-select': { py: 0 } }}
                    >
                      <MenuItem value="amount">Tutar</MenuItem>
                      <MenuItem value="percentage">%</MenuItem>
                    </Select>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button variant="contained" onClick={handleApplyBulk} disabled={!bulkValue || isNaN(Number(bulkValue)) || Number(bulkValue) <= 0}>
            Uygula
          </Button>
        </Stack>
      </Stack>

      <Box onPaste={handlePaste}>
        <DataGrid
          rows={rows}
          columns={columns}
          editMode="cell"
          rowHeight={22}
          tabNavigation="content"
          hideFooter
          disableColumnMenu
          processRowUpdate={onProcessRowUpdate}
          sx={theme => ({
            '& .MuiDataGrid-cell': { fontSize: 12, border: `1px solid ${theme.palette.dashboard.border}` },
            '& .MuiDataGrid-columnHeader': { fontSize: 12 },
          })}
        />
      </Box>
    </Stack>
  );
};

export default FormItems;
