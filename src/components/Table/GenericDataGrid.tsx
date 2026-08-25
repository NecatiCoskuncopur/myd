'use client';

import type { ReadonlyURLSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { DataGrid, type DataGridProps, type GridPaginationModel, type GridValidRowModel } from '@mui/x-data-grid';

import TableWrapper from './TableWrapper';

type GenericDataGridProps<Row extends GridValidRowModel> = DataGridProps<Row> & {
  totalCount?: number;
  page: number;
  limit: number;
  searchParams?: ReadonlyURLSearchParams;
  noRowsMessage: string;
};

const GenericDataGrid = <Row extends GridValidRowModel>({
  rows,
  columns,
  loading,
  totalCount = 0,
  page,
  limit,
  searchParams,
  noRowsMessage,
  sx,
  ...props
}: GenericDataGridProps<Row>) => {
  const router = useRouter();

  const handlePaginationChange = (model: GridPaginationModel) => {
    const isPageSizeChanged = model.pageSize !== limit;

    const params = new URLSearchParams(searchParams?.toString());

    params.set('sayfa', String(isPageSizeChanged ? 1 : model.page + 1));

    params.set('limit', String(model.pageSize));

    router.push(`?${params.toString()}`);
  };

  return (
    <TableWrapper>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        autoHeight
        paginationMode="server"
        rowCount={totalCount}
        pageSizeOptions={[1, 5, 10, 50]}
        paginationModel={{
          page: page - 1,
          pageSize: limit,
        }}
        onPaginationModelChange={handlePaginationChange}
        slotProps={{
          noRowsOverlay: {
            children: noRowsMessage,
          },
        }}
        sx={[
          {
            '& .MuiDataGrid-main': {
              overflowX: 'hidden',
            },
          },
          ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
        ]}
        {...props}
      />
    </TableWrapper>
  );
};

export default GenericDataGrid;
