'use client';

import React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { Typography, Box, List, ListItem, ListItemText } from '@mui/material';

interface ChartProps {
  data:
    | {
        id: number;
        value: number;
        countryName: string;
        color: string;
        countryCode: string;
      }[]
    | [];
}

const Chart = ({ data }: ChartProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
      <Box sx={{ width: '100%', height: 240, display: 'flex', justifyContent: 'center' }}>
        <PieChart
          series={[
            {
              data: data,
              arcLabelMinAngle: 20,
              innerRadius: 30,
              arcLabel: item => {
                const originalPoint = data.find(d => d.id === item.id);
                return originalPoint ? originalPoint.countryCode : '';
              },
              valueFormatter: item => {
                const originalPoint = data.find(d => d.id === item.id);
                const name = originalPoint ? originalPoint.countryName : '';
                return `${name}: ${item.value} Gönderi`;
              },
            },
          ]}
          height={240}
        />
      </Box>
    </Box>
  );
};

export default Chart;
