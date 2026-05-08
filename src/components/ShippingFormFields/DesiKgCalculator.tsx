'use client';

import React from 'react';

import { Box, Grid, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';

import { StyledButton } from '@/components';

interface CalculatorProps {
  onCalculate: (value: number) => void;
}

const DesiKgCalculator = ({ onCalculate }: CalculatorProps) => {
  const { register, getValues } = useForm({
    defaultValues: { width: 0, height: 0, length: 0, weight: 0 },
  });
  const halfCeil = (value: number, step = 0.5) => {
    const inv = 1.0 / step;
    return Math.ceil(value * inv) / inv;
  };

  const handleInternalCalculate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const data = getValues();
    const desi = (Number(data.width) * Number(data.height) * Number(data.length)) / 5000;
    const weight = Number(data.weight);

    const result = desi > weight ? halfCeil(desi) : halfCeil(weight);
    onCalculate(result);
  };

  return (
    <Box sx={{ p: 2, width: 300 }}>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        Kg/Desi Hesaplayıcı
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6 }}>
          <TextField {...register('width')} label="En (cm)" type="number" size="small" fullWidth />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField {...register('length')} label="Boy (cm)" type="number" size="small" fullWidth />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField {...register('height')} label="Yükseklik (cm)" type="number" size="small" fullWidth />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField {...register('weight')} label="Ağırlık (kg)" type="number" size="small" fullWidth />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <StyledButton type="button" variant="contained" fullWidth size="small" onClick={handleInternalCalculate}>
            Hesapla ve Uygula
          </StyledButton>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DesiKgCalculator;
