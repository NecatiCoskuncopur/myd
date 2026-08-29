'use client';

import React, { useMemo, useState } from 'react';
import type { ClipboardEvent } from 'react';
import { Box, Button, Stack, useTheme } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import { buildPricingMatrix, GridRow } from '@/lib/buildPricingMatrix';
import { CarrierAccountTypes } from '@/types/carrierAccount';
import parsePricingRowsFromClipboard from '@/lib/parsePricingRowsFromClipboard';

type PricingZoneEditorProps = {
  value?: CarrierAccountTypes.IZone[];
  onChange: (zones: CarrierAccountTypes.IZone[]) => void;
};

const PricingZoneEditor = ({ value = [], onChange }: PricingZoneEditorProps) => {
  const theme = useTheme();

  const matrix = useMemo(() => buildPricingMatrix(9), []);

  const zonesToRows = (zones: CarrierAccountTypes.IZone[]): GridRow[] => {
    if (!zones.length) {
      return [matrix.createEmptyRow(), matrix.createThanRow()];
    }

    const rows: GridRow[] = [];

    const pricesLength = zones[0].prices.length;

    for (let i = 0; i < pricesLength; i++) {
      const row: GridRow = {
        id: i.toString(),
        weight: zones[0].prices[i]?.weight ?? 0,
      };

      for (let z = 0; z < zones.length; z++) {
        row[`zone${z + 1}`] = zones[z].prices[i]?.price ?? null;
      }

      rows.push(row);
    }

    const lastWeight = zones[0].prices[pricesLength - 1]?.weight ?? 0;

    const thanRow: GridRow = {
      id: 'than',
      weight: `>${lastWeight}`,
    };

    for (let z = 0; z < zones.length; z++) {
      thanRow[`zone${z + 1}`] = zones[z].than ?? null;
    }

    return [...rows, thanRow];
  };

  const [rows, setRows] = useState<GridRow[]>(() => zonesToRows(value));

  const updateRows = (newRows: GridRow[]) => {
    setRows(newRows);

    onChange(matrix.rowsToZones(newRows));
  };

  const handlePastePrices = (event: ClipboardEvent<HTMLDivElement>) => {
    const text = event.clipboardData.getData('text/plain');

    if (!text.includes('\t') && !text.includes('\n')) {
      return;
    }

    event.preventDefault();

    const parsedRows = parsePricingRowsFromClipboard(text, matrix);

    if (!parsedRows) {
      return;
    }

    updateRows(parsedRows);
  };

  const addRow = () => {
    const thanRow = rows.find(row => row.id === 'than');
    const others = rows.filter(row => row.id !== 'than');

    updateRows([...others, matrix.createEmptyRow(), thanRow!]);
  };

  const removeLastRow = () => {
    const thanRow = rows.find(row => row.id === 'than');
    const others = rows.filter(row => row.id !== 'than');

    if (others.length <= 1) {
      return;
    }

    updateRows([...others.slice(0, -1), thanRow!]);
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2}>
        <Button variant="outlined" onClick={addRow}>
          Ağırlık Satırı Ekle
        </Button>

        <Button variant="outlined" color="error" onClick={removeLastRow}>
          Son Satırı Sil
        </Button>
      </Stack>
      <Box onPaste={handlePastePrices}>
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
            const updated = rows.map(row => (row.id === newRow.id ? newRow : row));

            updateRows(updated);

            return newRow;
          }}
        />
      </Box>
    </Stack>
  );
};

export default PricingZoneEditor;
