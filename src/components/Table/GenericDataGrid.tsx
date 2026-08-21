'use client';

import { useRouter } from 'next/navigation';
import { DataGrid, type DataGridProps } from '@mui/x-data-grid';

import TableWrapper from './TableWrapper';

type GenericDataGridProps = DataGridProps & {
  totalCount?: number;
  page: number;
  limit: number;
  searchParams?: URLSearchParams;
  noRowsMessage: string;
};

const GenericDataGrid = ({ rows, columns, loading, totalCount = 0, page, limit, searchParams, noRowsMessage, sx, ...props }: GenericDataGridProps) => {
  const router = useRouter();

  const handlePaginationChange = (model: { page: number; pageSize: number }) => {
    const isPageSizeChanged = model.pageSize !== limit;

    const params = new URLSearchParams(searchParams);

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
        sx={{
          '& .MuiDataGrid-main': {
            overflowX: 'hidden',
          },
          ...sx,
        }}
        {...props}
      />
    </TableWrapper>
  );
};

export default GenericDataGrid;
