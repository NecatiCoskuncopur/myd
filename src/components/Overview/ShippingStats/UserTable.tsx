'use client';

import React, { useEffect, useMemo, useState } from 'react';
import getTopFiveUser from '@/app/actions/summary/getTopFiveUser';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Alert } from '@mui/material';

const UserTable = () => {
  const [data, setData] = useState<SummaryTypes.IGetTopFiveUser[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await getTopFiveUser();

        if (response.status === 'OK' && response.data) {
          setData(response.data);
        } else {
          setError(response.message || 'hata');
        }
      } catch {
        setError('hata');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  console.log(data);

  const rows = useMemo(
    () =>
      data?.map(item => ({
        id: item.name,
        name: item.name,
        value: item.value,
      })) ?? [],
    [data],
  );

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Ad', flex: 1, minWidth: 100 },
    { field: 'value', headerName: 'Gönderi Sayısı', flex: 1, minWidth: 100 },
  ];

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        hideFooter={true}
        autoHeight
        sx={{
          '& .MuiDataGrid-main': {
            overflowX: 'hidden',
          },
        }}
      />
    </>
  );
};

export default UserTable;
