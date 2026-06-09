'use client';

import React, { useEffect, useState } from 'react';
import getBalanceDashboardData, { YearlyStatsResponse } from '@/app/actions/summary/getBalanceStats';
import { generalMessages, transactionMessages } from '@/constants';
import { Alert, Box, CircularProgress, Grid, Typography, useTheme, Select, MenuItem, FormControl, Paper, Divider } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const { BALANCE } = transactionMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

const formatNumber = (value: number) => {
  const absValue = Math.abs(value);
  const formatted = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(absValue);
  return `$${formatted}`;
};

const BalanceStats = () => {
  const theme = useTheme();

  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [yearsList, setYearsList] = useState<number[]>([]);
  const [chartData, setChartData] = useState<YearlyStatsResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async (year: number) => {
    setLoading(true);
    try {
      const response = await getBalanceDashboardData(year);
      if (response.status === 'OK' && response.data) {
        setChartData(response.data.monthlyStats);
        setYearsList(response.data.availableYears);

        if (!response.data.availableYears.includes(year)) {
          setYearsList(prev => [...prev, year].sort((a, b) => b - a));
        }
      } else {
        setError(response.message || BALANCE.NOT_FOUND);
      }
    } catch {
      setError(UNEXPECTED_ERROR);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(currentYear);
  }, [currentYear]);

  if (loading && !chartData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
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

  const paySeries: number[] = [];
  const spendSeries: number[] = [];
  const totalSeries: number[] = [];

  if (chartData) {
    for (let m = 1; m <= 12; m++) {
      paySeries.push(chartData[m]?.pay || 0);
      spendSeries.push(chartData[m]?.spend || 0);
      totalSeries.push(chartData[m]?.total || 0);
    }
  }

  const totalYearlyPay = paySeries.reduce((sum, val) => sum + val, 0);
  const totalYearlySpend = spendSeries.reduce((sum, val) => sum + val, 0);
  const totalYearlyNet = totalSeries.reduce((sum, val) => sum + val, 0);

  const summaryCards = [
    {
      title: 'Yıllık Toplam Ödeme',
      value: totalYearlyPay,
      color: theme.palette.success.main,
      icon: <TrendingUpIcon sx={{ color: theme.palette.success.main, fontSize: '28px' }} />,
    },
    {
      title: 'Yıllık Toplam Harcama',
      value: totalYearlySpend,
      color: theme.palette.error.main,
      icon: <TrendingDownIcon sx={{ color: theme.palette.error.main, fontSize: '28px' }} />,
      isSpend: true,
    },
    {
      title: 'Yıllık Net Durum',
      value: totalYearlyNet,
      color: totalYearlyNet >= 0 ? theme.palette.success.light : theme.palette.error.light,
      icon: (
        <AccountBalanceWalletIcon
          sx={{ opacity: 0.8, fontSize: '28px', color: totalYearlyNet >= 0 ? theme.palette.success.light : theme.palette.error.light }}
        />
      ),
    },
  ];

  return (
    <Grid container spacing={3} sx={{ alignItems: 'strech' }}>
      <Grid size={{ xs: 12 }}>
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: theme.palette.dashboard.sidebar,
            color: theme.palette.dashboard.textSidebar,
            padding: '16px 24px',
            borderRadius: '12px',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '0.5px' }}>
            Bakiye ve Harcama Analizi
          </Typography>

          <FormControl
            size="small"
            sx={{
              minWidth: 120,
              '& .MuiOutlinedInput-root': {
                color: theme.palette.dashboard.textSidebar,
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
                '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
              },
              '& .MuiSelect-icon': { color: theme.palette.dashboard.textSidebar },
            }}
          >
            <Select value={currentYear} onChange={e => setCurrentYear(Number(e.target.value))} disabled={loading}>
              {yearsList.map(year => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
        <Paper
          elevation={0}
          sx={{
            backgroundColor: theme.palette.dashboard.sidebar,
            color: theme.palette.dashboard.textSidebar,
            borderRadius: '12px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            height: '100%',
          }}
        >
          {summaryCards.map((card, idx) => (
            <React.Fragment key={idx}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: 1,
                  borderLeft: `4px solid ${card.color}`,
                  pl: 2,
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {card.title}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: card.isSpend && card.value > 0 ? theme.palette.error.main : card.color }}>
                    {card.isSpend && card.value > 0 ? `-${formatNumber(card.value)}` : formatNumber(card.value)}
                  </Typography>
                </Box>
                {card.icon}
              </Box>
              {idx < summaryCards.length - 1 && <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', my: 2 }} />}
            </React.Fragment>
          ))}
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex' }}>
        <Paper
          elevation={0}
          sx={{
            backgroundColor: theme.palette.dashboard.sidebar,
            borderRadius: '12px',
            padding: '24px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          {loading && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: 'rgba(0,0,0,0.1)',
                zIndex: 2,
                borderRadius: '12px',
              }}
            >
              <CircularProgress />
            </Box>
          )}

          <Box sx={{ width: '100%', height: 400, overflowX: 'auto' }}>
            <BarChart
              xAxis={[{ scaleType: 'band', data: MONTHS_TR }]}
              series={[
                { data: paySeries, label: 'Ödemeler', color: theme.palette.success.main },
                { data: spendSeries, label: 'Harcamalar', color: theme.palette.error.main },
                { data: totalSeries, label: 'Net Toplam', color: theme.palette.info.main },
              ]}
              margin={{ top: 50, bottom: 30, left: 60, right: 20 }}
              sx={{
                '& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel': { fill: theme.palette.dashboard.textSidebar, opacity: 0.8 },
                '& .MuiChartsAxis-left .MuiChartsAxis-tickLabel': { fill: theme.palette.dashboard.textSidebar, opacity: 0.8 },
                '& .MuiChartsAxis-line': { stroke: 'rgba(255, 255, 255, 0.1)' },
                '& .MuiChartsAxis-tick': { stroke: 'rgba(255, 255, 255, 0.1)' },
                '& .MuiChartsGrid-line': { stroke: 'rgba(255, 255, 255, 0.05)' },
              }}
            />
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default BalanceStats;
