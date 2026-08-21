'use client';

import React, { useEffect, useMemo, useState, useTransition } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, useTheme } from '@mui/material';
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
  const theme = useTheme();

  const [pending, startTransition] = useTransition();

  const { showSnackbar } = useSnackbar();

  const matrix = useMemo(() => buildPricingMatrix(9), []);

  const createInitialRows = (): GridRow[] => [matrix.createEmptyRow(), matrix.createThanRow()];

  const [rows, setRows] = useState<GridRow[]>(createInitialRows);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
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

      return [...others.slice(0, -1), thanRow];
    });
  };

  const processRowUpdate = (newRow: GridRow) => {
    setRows(prev => prev.map(row => (row.id === newRow.id ? newRow : row)));

    return newRow;
  };

  const handleClose = () => {
    reset();

    setRows(createInitialRows());

    onClose();
  };

  const onSubmit = (data: PricingListTypes.ICreatePricingListPayload) => {
    if (!list) {
      return;
    }

    startTransition(async () => {
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

      onSuccess?.();

      handleClose();
    });
  };

  return (
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
      <form onSubmit={handleSubmit(onSubmit)}>
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
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button type="button" onClick={handleClose} disabled={pending}>
            İptal
          </Button>

          <StyledButton type="submit" variant="contained" loading={pending}>
            Güncelle
          </StyledButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UpdateList;
