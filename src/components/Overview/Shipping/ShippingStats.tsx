'use client';

import React, { useEffect, useState } from 'react';

import { generalMessages } from '@/constants';
import { Alert, Box, CircularProgress, Paper, Typography, useTheme, Divider } from '@mui/material';
import AddBoxIcon from '@mui/icons-material/AddBox';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CancelIcon from '@mui/icons-material/Cancel';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import getShippingStats from '@/app/actions/summary/getShippingStats';

const { UNEXPECTED_ERROR } = generalMessages;

const ShippingStats = () => {
  const theme = useTheme();
  const [data, setData] = useState<SummaryTypes.IShippingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await getShippingStats();
      if (response.status === 'OK' && response.data) {
        setData(response.data);
      } else {
        setError(response.message || UNEXPECTED_ERROR);
      }
    } catch {
      setError(UNEXPECTED_ERROR);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '500px', width: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2, width: '100%' }}>
        {error}
      </Alert>
    );
  }

  const statItems = [
    {
      title: 'Toplam Kargo',
      value: data.TOTAL,
      color: theme.palette.info.main,
      icon: <LocalShippingIcon sx={{ color: theme.palette.info.main, fontSize: '24px' }} />,
    },
    {
      title: 'Oluşturulanlar',
      value: data.CREATED,
      color: theme.palette.warning.main,
      icon: <AddBoxIcon sx={{ color: theme.palette.warning.main, fontSize: '24px' }} />,
    },
    {
      title: 'Etiketlenenler',
      value: data.LABELED,
      color: theme.palette.success.main,
      icon: <LocalOfferIcon sx={{ color: theme.palette.success.main, fontSize: '24px' }} />,
    },
    {
      title: 'İptal Edilenler',
      value: data.CANCELLED,
      color: theme.palette.error.main,
      icon: <CancelIcon sx={{ color: theme.palette.error.main, fontSize: '24px' }} />,
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: theme.palette.dashboard?.sidebar || '#1e1e1e',
        color: theme.palette.dashboard?.textSidebar,
        borderRadius: '12px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: '0.5px' }}>
          Kargo Durum Özeti
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Anlık sistem verileri
        </Typography>
      </Box>

      {statItems.map((item, idx) => (
        <React.Fragment key={idx}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 1.5,
              pl: 1.5,
              borderLeft: `4px solid ${item.color}`,
              transition: 'background-color 0.2s',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
              },
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {item.title}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.2 }}>
                {item.value}
              </Typography>
            </Box>
            <Box sx={{ pr: 1 }}>{item.icon}</Box>
          </Box>
          {idx < statItems.length - 1 && <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.06)', my: 1 }} />}
        </React.Fragment>
      ))}
    </Paper>
  );
};

export default ShippingStats;
