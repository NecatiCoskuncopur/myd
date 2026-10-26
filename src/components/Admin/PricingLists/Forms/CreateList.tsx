'use client';

import { useMemo, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useForm } from 'react-hook-form';

import createPricingList from '@/app/actions/admin/createPricingList';
import { StyledButton } from '@/components';
import { CarrierAccountTypeEnum, generalMessages, pricingListMessages } from '@/constants';
import { buildPricingMatrix, GridRow } from '@/lib/buildPricingMatrix';
import parsePricingRowsFromClipboard from '@/lib/parsePricingRowsFromClipboard';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { PricingListTypes } from '@/types/pricingList';

import FormItems from './FormItems';

type CreateListProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

const { SUCCESS } = pricingListMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const CreateList = ({ open, onClose, onSuccess }: CreateListProps) => {
  const { showSnackbar } = useSnackbar();

  const matrix = useMemo(() => buildPricingMatrix(9), []);

  const createInitialRows = (): GridRow[] => [matrix.createEmptyRow(), matrix.createThanRow()];

  const [rows, setRows] = useState<GridRow[]>(createInitialRows);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PricingListTypes.ICreatePricingListPayload>({
    defaultValues: {
      name: '',
      listType: CarrierAccountTypeEnum.ECONOMY,
      zone: [],
    },
  });

  const addRow = () => {
    setRows(prev => {
      const thanRow = prev.find(row => row.id === 'than');
      const others = prev.filter(row => row.id !== 'than');

      if (!thanRow) {
        return prev;
      }

      return [...others, matrix.createEmptyRow(), thanRow];
    });
  };

  const removeLastRow = () => {
    setRows(prev => {
      const thanRow = prev.find(row => row.id === 'than');
      const others = prev.filter(row => row.id !== 'than');

      if (!thanRow || others.length <= 1) {
        return prev;
      }

      return [...others.slice(0, -1), thanRow];
    });
  };

  const processRowUpdate = (newRow: GridRow) => {
    setRows(prev => prev.map(row => (row.id === newRow.id ? newRow : row)));

    return newRow;
  };

  const handlePastePrices = (text: string) => {
    const parsedRows = parsePricingRowsFromClipboard(text, matrix);

    if (!parsedRows) {
      return;
    }

    setRows(parsedRows);
  };

  const resetForm = () => {
    reset();
    setRows(createInitialRows());
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    resetForm();
    onClose();
  };

  const handleBulkPriceUpdate = (operation: 'increase' | 'decrease', type: 'amount' | 'percentage', value: number) => {
    setRows(prevRows =>
      prevRows.map(row => {
        const newRow = { ...row };

        Object.keys(newRow).forEach(key => {
          if (key.startsWith('zone') && newRow[key] !== null && newRow[key] !== '') {
            const currentValue = Number(newRow[key]);

            if (!isNaN(currentValue)) {
              let updatedValue = currentValue;

              const changeAmount = type === 'amount' ? value : currentValue * (value / 100);

              if (operation === 'increase') {
                updatedValue += changeAmount;
              } else if (operation === 'decrease') {
                updatedValue -= changeAmount;
              }

              newRow[key] = Math.max(0, Number(updatedValue.toFixed(2)));
            }
          }
        });

        return newRow;
      }),
    );
  };

  const onSubmit = async (data: PricingListTypes.ICreatePricingListPayload) => {
    try {
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

      resetForm();

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
      maxWidth="lg"
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
      <DialogTitle>Fiyat Listesi Oluştur</DialogTitle>

      <DialogContent>
        <FormItems
          control={control}
          errors={errors}
          rows={rows}
          columns={matrix.columns}
          onAddRow={addRow}
          onRemoveLastRow={removeLastRow}
          onProcessRowUpdate={processRowUpdate}
          onPastePrices={handlePastePrices}
          onBulkPriceUpdate={handleBulkPriceUpdate}
        />
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
        }}
      >
        <Button type="button" onClick={handleClose} disabled={isSubmitting}>
          İptal
        </Button>

        <StyledButton type="button" variant="contained" loading={isSubmitting} disabled={isSubmitting} onClick={handleSubmit(onSubmit)}>
          Oluştur
        </StyledButton>
      </DialogActions>
    </Dialog>
  );
};

export default CreateList;
