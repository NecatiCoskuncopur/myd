'use client';

import { Dispatch, SetStateAction, useMemo } from 'react';
import { ReadonlyURLSearchParams } from 'next/navigation';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Box, IconButton, Typography } from '@mui/material';
import type { GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';

import { GenericDataGrid } from '@/components';
import { ShippingStatus } from '@/constants';
import { ShippingTypes } from '@/types/shipping';

import columns from './columns';

type ShippingTableProps = {
  rows: ShippingTypes.IShipping[];
  totalCount?: number;
  loading: boolean;
  page: number;
  limit: number;
  searchParams: ReadonlyURLSearchParams;
  selectedShippingIds: string[];
  setSelectedShippingIds: Dispatch<SetStateAction<string[]>>;
  onOpenActions: (row: ShippingTypes.IShipping, anchorEl: HTMLElement) => void;
};

const ShippingTable = ({
  rows,
  totalCount,
  loading,
  page,
  limit,
  searchParams,
  selectedShippingIds,
  setSelectedShippingIds,
  onOpenActions,
}: ShippingTableProps) => {
  const shippingColumns = useMemo<GridColDef[]>(
    () => [
      ...columns,
      {
        field: 'actions',
        headerName: 'İşlemler',
        flex: 1,
        minWidth: 120,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',

        renderCell: params => {
          const row = params.row as ShippingTypes.IShipping;

          const isCancelled = row.status === ShippingStatus.CANCELLED;

          if (isCancelled) {
            return (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  width: '100%',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: 'error.main',
                    fontWeight: 500,
                  }}
                >
                  Gönderi İptal Edildi
                </Typography>
              </Box>
            );
          }

          return (
            <IconButton type="button" size="small" aria-label="Gönderi işlemlerini aç" onClick={event => onOpenActions(row, event.currentTarget)}>
              <MoreVertIcon />
            </IconButton>
          );
        },
      },
    ],
    [onOpenActions],
  );

  const rowSelectionModel: GridRowSelectionModel = {
    type: 'include',
    ids: new Set(selectedShippingIds),
  };

  const handleRowSelectionChange = (model: GridRowSelectionModel) => {
    setSelectedShippingIds(Array.from(model.ids).map(String));
  };

  return (
    <GenericDataGrid
      rows={rows}
      columns={shippingColumns}
      loading={loading}
      totalCount={totalCount}
      page={page}
      limit={limit}
      searchParams={searchParams}
      noRowsMessage="Henüz kayıtlı bir gönderiniz bulunmuyor."
      checkboxSelection
      disableRowSelectionOnClick
      isRowSelectable={params => !params.row.carrier?.trackingNumber}
      rowSelectionModel={rowSelectionModel}
      onRowSelectionModelChange={handleRowSelectionChange}
    />
  );
};

export default ShippingTable;
