'use client';

import { useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import getUserPricingList from '@/app/actions/user/getUserPricingList';
import PriceCalculator from './PriceCalculator';

type Row = {
  id: number;
  weight: number | string;
  [key: string]: number | string | null;
};

const UserPriceList = () => {
  const theme = useTheme();
  const [data, setData] = useState<IPricingList | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const fetchUserPriceList = async () => {
      setLoading(true);
      try {
        const result = await getUserPricingList();
        if (result.status === 'OK' && result.data) {
          setData(result.data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserPriceList();
  }, [isMounted]);

  const columns: GridColDef[] = useMemo(() => {
    if (!data) return [];

    return [
      {
        field: 'weight',
        headerName: 'Ağırlık',
        flex: 1,
      },
      ...data.zone.map(z => ({
        field: `zone${z.number}`,
        headerName: `${z.number}. Bölge`,
        flex: 1,
      })),
    ];
  }, [data]);

  const rows: Row[] = useMemo(() => {
    if (!data) return [];

    const weightSet = new Set<number>();

    data.zone.forEach(z => {
      z.prices.forEach(p => {
        weightSet.add(p.weight ?? 0);
      });
    });

    const weights = Array.from(weightSet).sort((a, b) => a - b);

    const baseRows: Row[] = weights.map((weight, i) => {
      const row: Row = {
        id: i + 1,
        weight,
      };

      data.zone.forEach(z => {
        const found = z.prices.find(p => p.weight === weight);
        row[`zone${z.number}`] = found?.price ?? null;
      });

      return row;
    });

    const thanRow: Row = {
      id: weights.length + 1,
      weight: 'Paket Aşımı',
    };

    data.zone.forEach(z => {
      thanRow[`zone${z.number}`] = z.than ?? null;
    });

    return [...baseRows, thanRow];
  }, [data]);

  if (!isMounted) return null;

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        backgroundColor: theme.palette.dashboard.sidebar,
        color: theme.palette.dashboard.textSidebar,
        p: 5,
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column' },
          gap: 2,
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 3,
        }}
      >
        <Typography variant="h5">Fiyat Listem</Typography>

        <PriceCalculator />
      </Box>
      <Box
        sx={{
          width: '100%',
          overflowX: 'auto',
        }}
      >
        <Box sx={{ minWidth: 700 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            hideFooter
            editMode="cell"
            rowHeight={24}
            disableColumnMenu
            getRowClassName={params => (params.row.weight === 'Paket Aşımı' ? 'than-row' : '')}
            sx={{
              '& .MuiDataGrid-cell': { fontSize: 14, border: `1px solid ${theme.palette.dashboard.border}` },
              '& .MuiDataGrid-columnHeader': { fontSize: 14 },
              '& .than-row': {
                fontWeight: 'bold',
                backgroundColor: theme.palette.action.hover,
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default UserPriceList;
