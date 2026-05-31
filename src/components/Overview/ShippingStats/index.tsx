'use client';

import { Alert, Box, CircularProgress, useTheme, Typography, Grid } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { countries, generalMessages, transactionMessages } from '@/constants';
import getTopFiveCountry from '@/app/actions/summary/getTopFiveCountry';
import Chart from './Chart';
import UserTable from '@/components/Overview/ShippingStats/UserTable';

const { BALANCE } = transactionMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const DONUT_COLORS = ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2'];

const ShippingStats = () => {
  const theme = useTheme();

  const [stats, setStats] = useState<SummaryTypes.IGetTopFiveCountry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await getTopFiveCountry();

        if (response.status === 'OK' && response.data) {
          setStats(response.data);
        } else {
          setError(response.message || BALANCE.NOT_FOUND);
        }
      } catch {
        setError(UNEXPECTED_ERROR);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const countryLookup = React.useMemo(() => {
    const lookup = new Map<string, string>();
    countries.forEach(c => {
      if (c.code) {
        lookup.set(c.code.trim().toUpperCase(), c.turkishName);
      }
    });
    return lookup;
  }, []);

  const formattedData = React.useMemo(() => {
    return stats?.map((item, index) => {
      const upperCode = item.country ? item.country.trim().toUpperCase() : '';
      const displayName = countryLookup.get(upperCode) || item.country || 'Bilinmeyen Ülke';

      return {
        id: index,
        value: item.value,
        countryName: displayName,
        countryCode: upperCode,
        color: DONUT_COLORS[index] || '#757575',
      };
    });
  }, [stats, countryLookup]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!stats) return null;

  return (
    <Grid container spacing={2} sx={{ marginBottom: '20px' }}>
      <Grid
        size={{ sm: 12, md: 6 }}
        sx={{
          backgroundColor: theme.palette.dashboard.sidebar,
          color: theme.palette.dashboard.textSidebar,
          borderRadius: '12px',
          padding: { xs: '12px', sm: '20px' },
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
          En Çok Gönderim Yapılan Ülkeler (Top 5)
        </Typography>
        <Chart data={formattedData ?? []} />
      </Grid>
      <Grid
        size={{ sm: 12, md: 6 }}
        sx={{
          backgroundColor: theme.palette.dashboard.sidebar,
          color: theme.palette.dashboard.textSidebar,
          borderRadius: '12px',
          padding: { xs: '12px', sm: '20px' },
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
          En Çok Gönderim Yapan Kullanıcılar (Top 5)
        </Typography>
        <UserTable />
      </Grid>
    </Grid>
  );
};

export default ShippingStats;
