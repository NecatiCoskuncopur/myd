'use client';

import { useState } from 'react';

import { Autocomplete, Box, CircularProgress, TextField, Typography } from '@mui/material';

import calculateShipping from '@/app/actions/shipping/calculateShipping';
import { StyledButton } from '@/components';
import { countries, shippingMessages } from '@/constants';

interface CountryOption {
  code: string;
  turkishName: string;
  [key: string]: unknown;
}

const PriceCalculator = () => {
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);
  const [weight, setWeight] = useState<number | ''>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCalculate = async () => {
    if (!selectedCountry || weight === '' || Number(weight) < 0.1) return;

    setLoading(true);
    setResult(null);
    setErrorMessage(null);

    try {
      const res = await calculateShipping({
        countryCode: selectedCountry.code,
        weight: Number(weight),
      });

      if (res.status === 'OK' && res.data !== undefined) {
        setResult(res.data);
      } else {
        setErrorMessage(res.message || 'Hesaplama yapılırken bir hata oluştu.');
      }
    } catch {
      setErrorMessage('Ağ hatası oluştu, lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const isWeightInvalid = weight !== '' && Number(weight) < 0.1;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        width: '100%',
        paddingTop: '20px',
        borderTop: '1px solid',
        borderColor: 'rgba(255, 255, 255, 0.08)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexDirection: { xs: 'column', lg: 'row' },
        }}
      >
        <Typography variant="h6" sx={{ alignSelf: 'center' }}>
          Hesaplama
        </Typography>

        <Autocomplete
          options={countries as CountryOption[]}
          getOptionLabel={option => option.turkishName || ''}
          value={selectedCountry}
          onChange={(_, newValue) => {
            setSelectedCountry(newValue);
            setErrorMessage(null);
          }}
          sx={{ width: { xs: '100%', lg: 200 } }}
          renderInput={params => <TextField {...params} label="Varış Ülkesi" placeholder="Ülke ara..." />}
        />

        <TextField
          label="Desi / KG"
          type="number"
          value={weight}
          error={isWeightInvalid}
          helperText={isWeightInvalid ? shippingMessages.WEIGHT.MIN : ''}
          onChange={e => {
            const val = e.target.value;
            setWeight(val === '' ? '' : Number(val));
            setErrorMessage(null);
          }}
          slotProps={{
            htmlInput: {
              step: 0.1,
              min: 0.1,
            },
          }}
          sx={{ width: { xs: '100%', lg: 200 } }}
        />
        <StyledButton
          variant="contained"
          onClick={handleCalculate}
          disabled={loading || !selectedCountry || weight === '' || isWeightInvalid}
          sx={{ width: { xs: '100%', lg: 'auto' } }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : 'Hesapla'}
        </StyledButton>

        {result !== null && (
          <Typography sx={{ alignSelf: 'center', ml: 1 }}>
            Sonuç: <strong>{result} $</strong>
          </Typography>
        )}
      </Box>

      {errorMessage && (
        <Typography color="error.main" variant="body2" sx={{ ml: 1 }}>
          {errorMessage}
        </Typography>
      )}
    </Box>
  );
};

export default PriceCalculator;
