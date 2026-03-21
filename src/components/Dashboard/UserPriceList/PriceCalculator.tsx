'use client';

import { useState } from 'react';

import { Box, Button, CircularProgress, MenuItem, TextField, Typography } from '@mui/material';

import calculateShipping from '@/app/actions/shipping/calculateShipping';
import { countries } from '@/constants';

const PriceCalculator = () => {
  const [countryCode, setCountryCode] = useState<string>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  const handleCalculate = async () => {
    if (!countryCode || !weight) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await calculateShipping({
        countryCode,
        weight: Number(weight),
      });

      if (res.status === 'OK' && res.data !== undefined) {
        setResult(res.data);
      } else {
        alert(res.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        border: '1px solid #ddd',
        p: 2,
        borderRadius: 2,
        mb: 3,
        width: '100%',
      }}
    >
      <Typography variant="h5" mb={2}>
        Hesapla
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <TextField select label="Varış Ülkesi" value={countryCode} onChange={e => setCountryCode(e.target.value)} sx={{ width: 200 }}>
          {countries.map(country => (
            <MenuItem key={country.code} value={country.code}>
              {country.turkishName}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Desi / KG"
          type="number"
          value={weight}
          onChange={e => {
            const val = e.target.value;
            setWeight(val === '' ? '' : Number(val));
          }}
          inputProps={{ step: 0.5, min: 0.5 }}
          sx={{ width: 200 }}
        />

        <Button
          variant="contained"
          onClick={handleCalculate}
          disabled={loading}
          sx={{
            p: '10px 22px',
            backgroundColor: '#5F4AFE',
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: '#4C3BCB',
            },
          }}
        >
          {loading ? <CircularProgress size={20} /> : 'Hesapla'}
        </Button>

        {result !== null && (
          <Typography>
            Sonuç: <strong>{result} ₺</strong>
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default PriceCalculator;
