'use client';

import React, { useEffect, useState } from 'react';
import getBalanceStats from '@/app/actions/summary/getBalanceStats';
import { generalMessages, transactionMessages } from '@/constants';
import { Alert, Box, CircularProgress, Grid, Typography, useTheme, Paper, Divider } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const { BALANCE } = transactionMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const formatNumber = (value: number) => {
  const absValue = Math.abs(value);
  const formatted = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(absValue);

  return value < 0 ? `$${formatted}` : `$${formatted}`;
};
const BalanceStats = () => {
  const theme = useTheme();

  const [stats, setStats] = useState<SummaryTypes.IBalanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await getBalanceStats();

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

  const cardItems = [
    { title: 'Günlük Bakiye', data: stats.daily },
    { title: 'Aylık Bakiye', data: stats.monthly },
    { title: 'Yıllık Bakiye', data: stats.yearly },
  ];

  return (
    <Grid container spacing={3}>
      {cardItems.map((item, index) => (
        <Grid
          size={{ xs: 12, md: 4 }}
          key={index}
          sx={{
            backgroundColor: theme.palette.dashboard.sidebar,
            color: theme.palette.dashboard.textSidebar,
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {item.title}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon sx={{ color: theme.palette.success.main }} />
                <Typography variant="body2">Ödemeler</Typography>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                {formatNumber(item.data.pay)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingDownIcon sx={{ color: theme.palette.error.main }} />
                <Typography variant="body2">Harcamalar</Typography>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.error.main }}>
                {item.data.spend > 0 ? `-${formatNumber(item.data.spend)}` : formatNumber(item.data.spend)}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 0.5 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountBalanceWalletIcon sx={{ opacity: 0.7 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Net Toplam
              </Typography>
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: item.data.total >= 0 ? theme.palette.success.light : theme.palette.error.light,
              }}
            >
              {formatNumber(item.data.total)}
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default BalanceStats;
