'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import getShippingMapStats from '@/app/actions/summary/getShippingMapStats';
import { countries, generalMessages } from '@/constants';
import { Alert, Box, CircularProgress, Paper, useTheme, Typography, Grid, IconButton, useMediaQuery } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import Highcharts from 'highcharts/highmaps';
import HighchartsReact from 'highcharts-react-official';

const { UNEXPECTED_ERROR } = generalMessages;

const HeatMap = () => {
  const theme = useTheme();
  const chartRef = useRef<any>(null);

  const [mapData, setMapdata] = useState<SummaryTypes.IHeatMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapTopology, setMapTopology] = useState<any>(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    import('@highcharts/map-collection/custom/world.topo.json').then(topology => setMapTopology(topology.default)).catch(() => setError(UNEXPECTED_ERROR));
  }, []);

  const fetchMapData = async () => {
    setLoading(true);
    try {
      const response = await getShippingMapStats();
      if (response.status === 'OK' && response.data) {
        setMapdata(response.data);
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
    if (mapTopology) fetchMapData();
  }, [mapTopology]);

  const handleZoomIn = () => {
    if (chartRef.current?.chart) {
      chartRef.current.chart.mapZoom(0.5);
    }
  };

  const handleZoomOut = () => {
    if (chartRef.current?.chart) {
      chartRef.current.chart.mapZoom(2);
    }
  };

  const handleResetZoom = () => {
    if (chartRef.current?.chart) {
      chartRef.current.chart.mapZoom();
    }
  };

  const finalChartData = useMemo(() => {
    if (!mapData || !mapTopology) return [];

    const countriesMap = new Map(countries.map(c => [c.code.toUpperCase(), c.turkishName]));
    return mapTopology.objects.default.geometries.map((geo: any) => {
      const properties = geo.properties;
      const hcCode2 = properties['iso-a2']?.toUpperCase();
      const hcCode3 = properties['iso-a3']?.toUpperCase();

      const value = mapData[hcCode2] || mapData[hcCode3] || 0;
      const turkishName = countriesMap.get(hcCode2) || countriesMap.get(hcCode3) || properties.name;

      const countryColor = value > 0 ? theme.palette.error.main : theme.palette.dashboard.content;

      return {
        'hc-key': properties['hc-key'],
        value: value,
        name: turkishName,
        color: countryColor,
      };
    });
  }, [mapData, mapTopology, theme]);

  const chartOptions = useMemo(() => {
    if (!mapTopology) return {};

    return {
      chart: {
        map: mapTopology,
        backgroundColor: theme.palette.dashboard?.sidebar,
        style: { fontFamily: 'inherit' },
        animation: false,
        reflow: true,
        pinchType: 'xy',
        aspectRatio: isMobile ? 0.7 : 0.3,
      },
      title: { text: null },
      credits: { enabled: false },
      colorAxis: {
        visible: false,
      },
      mapNavigation: {
        enabled: true,
        enableButtons: false,
        enableTouchZoom: true,
      },
      tooltip: {
        headerFormat: '',
        pointFormat: '<span style="font-weight: 600;">{point.name}</span>: <b>{point.value} Gönderi</b>',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        style: { color: '#fff', fontSize: '13px' },
        borderRadius: 8,
        shadow: false,
      },
      series: [
        {
          data: finalChartData,
          name: 'Gönderi Sayısı',
          borderColor: 'rgba(255, 255, 255, 0.15)',
          borderWidth: 0.5,
          states: {
            hover: {
              color: theme.palette.error.dark || '#c62828',
              borderColor: '#fff',
              borderWidth: 1,
            },
          },
          dataLabels: { enabled: false },
        },
      ],
    };
  }, [finalChartData, mapTopology, theme, isMobile]);

  if (loading || !mapTopology) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '500px' }}>
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

  return (
    <Grid container spacing={3} sx={{ width: '100%', m: 0 }}>
      <Grid size={{ xs: 12 }}>
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: theme.palette.dashboard?.sidebar || '#1e1e2f',
            color: theme.palette.dashboard?.textSidebar || '#fff',
            padding: '16px 24px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '0.5px' }}>
            Ülkelere Göre Kargo Dağılımı
          </Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: theme.palette.dashboard?.sidebar || '#1e1e2f',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            p: 2,
            position: 'relative',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              bottom: 32,
              right: 32,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              zIndex: 10,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              padding: '6px',
              borderRadius: '8px',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <IconButton onClick={handleZoomIn} size="small" sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
              <AddIcon fontSize="small" />
            </IconButton>
            <IconButton onClick={handleZoomOut} size="small" sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
              <RemoveIcon fontSize="small" />
            </IconButton>
            <IconButton onClick={handleResetZoom} size="small" sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
              <RestartAltIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{ width: '100%' }}>
            <HighchartsReact ref={chartRef} highcharts={Highcharts} constructorType={'mapChart'} options={chartOptions} />
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default HeatMap;
