'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useForm } from 'react-hook-form';

import updatePricingList from '@/app/actions/admin/updatePricingList';
import { StyledButton } from '@/components';
import { generalMessages, pricingListMessages } from '@/constants';
import { buildPricingMatrix, GridRow } from '@/lib/buildPricingMatrix';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { PricingListTypes } from '@/types/pricingList';

import FormItems from './FormItems';

type UpdateListProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  list: PricingListTypes.IPricingList | null;
};

const { UPDATE } = pricingListMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const UpdateList = ({ open, onClose, onSuccess, list }: UpdateListProps) => {
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
      listType: undefined,
      zone: [],
    },
  });

  useEffect(() => {
    if (!open || !list) {
      return;
    }

    reset({
      name: list.name,
      listType: list.listType,
      zone: [],
    });

    if (!list.zone?.length) {
      setRows(createInitialRows());
      return;
    }

    const pricesLength = list.zone[0]?.prices?.length ?? 0;

    if (pricesLength === 0) {
      setRows(createInitialRows());
      return;
    }

    const newRows: GridRow[] = [];

    for (let i = 0; i < pricesLength; i++) {
      const row: GridRow = {
        id: i.toString(),
        weight: list.zone[0]?.prices[i]?.weight ?? 0,
      };

      for (let zoneIndex = 0; zoneIndex < list.zone.length; zoneIndex++) {
        const price = list.zone[zoneIndex]?.prices[i];

        row[`zone${zoneIndex + 1}`] = price?.price ?? null;
      }

      newRows.push(row);
    }

    const lastWeight = list.zone[0]?.prices[pricesLength - 1]?.weight ?? 0;

    const thanRow: GridRow = {
      id: 'than',
      weight: `>${lastWeight}`,
    };

    for (let zoneIndex = 0; zoneIndex < list.zone.length; zoneIndex++) {
      thanRow[`zone${zoneIndex + 1}`] = list.zone[zoneIndex]?.than ?? null;
    }

    setRows([...newRows, thanRow]);
  }, [open, list, reset, matrix]);

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

      const nextOthers = others.slice(0, -1);

      const lastWeight = nextOthers[nextOthers.length - 1]?.weight ?? '';

      return [
        ...nextOthers,
        {
          ...thanRow,
          weight: `>${lastWeight}`,
        },
      ];
    });
  };

  const processRowUpdate = (newRow: GridRow) => {
    setRows(prev => {
      const updatedRows = prev.map(row => (row.id === newRow.id ? newRow : row));

      const normalRows = updatedRows.filter(row => row.id !== 'than');

      const lastWeight = normalRows[normalRows.length - 1]?.weight ?? '';

      return updatedRows.map(row =>
        row.id === 'than'
          ? {
              ...row,
              weight: `>${lastWeight}`,
            }
          : row,
      );
    });

    return newRow;
  };

  const parseNumber = (value: string): number | null => {
    if (!value) {
      return null;
    }

    const normalized = value.replace(/kg/gi, '').replace(/\s/g, '').replace(',', '.');

    const number = Number(normalized);

    return Number.isNaN(number) ? null : number;
  };

  const handlePastePrices = (text: string) => {
    const pastedRows = text
      .replace(/\r/g, '')
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.split('\t').map(cell => cell.trim()));

    if (pastedRows.length === 0) {
      return;
    }

    const normalRows: GridRow[] = [];
    let thanRow: GridRow | null = null;

    pastedRows.forEach(cells => {
      const firstCell = cells[0] ?? '';
      if (!firstCell) {
        const row = matrix.createThanRow();

        for (let zoneIndex = 0; zoneIndex < 9; zoneIndex++) {
          row[`zone${zoneIndex + 1}`] = parseNumber(cells[zoneIndex + 1] ?? '');
        }

        thanRow = row;

        return;
      }

      const weight = parseNumber(firstCell);

      if (weight === null) {
        return;
      }

      const row = matrix.createEmptyRow();

      row.weight = weight;

      for (let zoneIndex = 0; zoneIndex < 9; zoneIndex++) {
        row[`zone${zoneIndex + 1}`] = parseNumber(cells[zoneIndex + 1] ?? '');
      }

      normalRows.push(row);
    });

    if (normalRows.length === 0) {
      return;
    }

    const lastWeight = normalRows[normalRows.length - 1]?.weight ?? '';

    const finalThanRow = thanRow ?? matrix.createThanRow();

    finalThanRow.weight = `>${lastWeight}`;

    setRows([...normalRows, finalThanRow]);
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

  const onSubmit = async (data: PricingListTypes.ICreatePricingListPayload) => {
    if (!list) {
      return;
    }

    try {
      const zones = matrix.rowsToZones(rows);

      const response = await updatePricingList({
        pricingListId: list._id,
        name: data.name,
        listType: data.listType,
        zone: zones,
      });

      if (response.status === 'ERROR') {
        showSnackbar(response.message ?? UNEXPECTED_ERROR, 'error');

        return;
      }

      showSnackbar(response.message ?? UPDATE, 'success');

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
      <DialogTitle>Fiyat Listesini Düzenle</DialogTitle>

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
          Güncelle
        </StyledButton>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateList;
