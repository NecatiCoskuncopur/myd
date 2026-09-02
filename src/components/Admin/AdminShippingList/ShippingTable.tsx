'use client';

import { useMemo } from 'react';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';

import { GenericDataGrid } from '@/components';
import { ShippingStatus } from '@/constants';
import { ShippingTypes } from '@/types/shipping';

import columns from './columns';

interface ShippingTableProps {
  rows: ShippingTypes.IShipping[];
  totalCount?: number;
  loading: boolean;
  page: number;
  limit: number;
  searchParams: ReadonlyURLSearchParams;
  onOpenActions: (row: ShippingTypes.IShipping, anchorEl: HTMLButtonElement) => void;
  onPrintLabel: (shippingId: string) => Promise<void>;
}

const ShippingTable = ({ rows, totalCount, loading, page, limit, searchParams, onOpenActions, onPrintLabel }: ShippingTableProps) => {
  const shippingColumns = useMemo<GridColDef<ShippingTypes.IShipping>[]>(
    () => [
      ...columns,
      {
        field: 'actions',
        headerName: 'İşlemler',
        flex: 1,
        minWidth: 120,
        sortable: false,
        filterable: false,
        renderCell: params => {
          const row = params.row;
          const isCancelled = row.status === ShippingStatus.CANCELLED;

          if (isCancelled) {
            return (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '100%',
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
          const hasLabel = Boolean(row.carrier?.trackingNumber);

          return (
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', height: '100%' }}>
              <Tooltip title="İşlemler">
                <IconButton
                  size="small"
                  onClick={event => {
                    event.stopPropagation();
                    onOpenActions(row, event.currentTarget);
                  }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {hasLabel && (
                <Tooltip title="Barkodu Yazdır">
                  <IconButton
                    size="small"
                    onClick={event => {
                      event.stopPropagation();
                      void onPrintLabel(row._id);
                    }}
                  >
                    <PrintOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          );
        },
      },
    ],
    [onOpenActions],
  );

  return (
    <GenericDataGrid
      rows={rows}
      columns={shippingColumns}
      loading={loading}
      totalCount={totalCount}
      page={page}
      limit={limit}
      searchParams={searchParams}
      noRowsMessage="Henüz kayıtlı bir gönderi bulunmuyor."
    />
  );
};

export default ShippingTable;
