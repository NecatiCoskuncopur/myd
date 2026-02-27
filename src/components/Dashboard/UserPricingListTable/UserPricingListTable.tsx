'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Box } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import getUserPricingList from '@/app/actions/user/getUserPricingList';
import { countries } from '@/constants';
import ZonePopover from './ZonePopover';

const UserPricingListTable = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('sayfa')) || 1;
  const limit = Number(searchParams.get('limit')) || 5;

  const [data, setData] = useState<IUserPricingListData | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPricing = async () => {
      setLoading(true);
      try {
        const result = await getUserPricingList({
          page,
          limit,
        });

        if (result.status === 'OK' && result.data) {
          setData(result.data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, [page, limit]);

  // rows
  const rows = useMemo(() => {
    return (
      data?.zones.map((zone, index) => {
        const row: Record<string, unknown> = {
          id: `${zone.number}-${index}`,
          zone: zone.number,
          than: zone.than,
        };

        zone.prices.forEach(price => {
          row[`weight_${price.weight}`] = price.price;
        });

        return row;
      }) ?? []
    );
  }, [data]);

  const weightColumns: GridColDef[] = useMemo(() => {
    if (!data?.zones.length) return [];

    const weights = Array.from(new Set(data.zones.flatMap(z => z.prices.map(p => p.weight))));

    return weights.map(weight => ({
      field: `weight_${weight}`,
      headerName: `${weight} kg`,
      width: 120,
    }));
  }, [data]);

  const columns: GridColDef[] = [
    {
      field: 'zone',
      headerName: 'Bölge',
      width: 100,
      renderCell: params => {
        const zone = params.value as number;
        return <ZonePopover zone={zone} countries={countries} />;
      },
    },
    ...weightColumns,
    {
      field: 'than',
      headerName: '+1',
      width: 100,
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        paginationMode="server"
        rowCount={data?.totalCount ?? 0}
        pageSizeOptions={[1, 5, 10, 20]}
        paginationModel={{
          page: page - 1,
          pageSize: limit,
        }}
        onPaginationModelChange={model => {
          const isPageSizeChanged = model.pageSize !== limit;

          router.push(`?sayfa=${isPageSizeChanged ? 1 : model.page + 1}&limit=${model.pageSize}`);
        }}
      />
    </Box>
  );
};

export default UserPricingListTable;
