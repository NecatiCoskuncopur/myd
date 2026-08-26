'use client';

import { useMemo } from 'react';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';

import { GenericDataGrid } from '@/components';
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
}

const ShippingTable = ({ rows, totalCount, loading, page, limit, searchParams, onOpenActions }: ShippingTableProps) => {
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
        renderCell: params => (
          <IconButton type="button" size="small" aria-label="Gönderi işlemleri" onClick={event => onOpenActions(params.row, event.currentTarget)}>
            <MoreVertIcon />
          </IconButton>
        ),
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
