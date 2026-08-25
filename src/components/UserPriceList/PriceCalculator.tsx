'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Autocomplete, Box, TextField, Typography } from '@mui/material';

import calculateShipping from '@/app/actions/shipping/calculateShipping';
import { StyledButton } from '@/components';
import { CarrierAccountTypeEnum, countries, generalMessages, pricingListMessages, shippingMessages } from '@/constants';

const { PRICE } = pricingListMessages;

type CountryOption = {
  code: string;
  turkishName: string;
  [key: string]: unknown;
};

type PriceCalculatorProps = {
  serviceType: CarrierAccountTypeEnum;
};

const PriceCalculator = ({ serviceType }: PriceCalculatorProps) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);

  const [weight, setWeight] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setResult(null);
    setErrorMessage(null);
  }, [serviceType]);

  const isWeightInvalid = weight !== '' && weight < 0.1;

  const canCalculate = Boolean(selectedCountry) && weight !== '' && !isWeightInvalid;

  const resetResult = () => {
    setResult(null);
    setErrorMessage(null);
  };

  const handleCalculate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedCountry || !canCalculate) {
      return;
    }

    setIsLoading(true);
    resetResult();

    try {
      const response = await calculateShipping({
        serviceType,
        countryCode: selectedCountry.code,
        weight,
      });

      if (response.status !== 'OK' || response.data == null) {
        setErrorMessage(response.message ?? PRICE.NOT_FOUND);
        return;
      }

      setResult(response.data);
    } catch {
      setErrorMessage(generalMessages.UNEXPECTED_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleCalculate}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        width: '100%',
        pt: 2.5,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexDirection: {
            xs: 'column',
            lg: 'row',
          },
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
            resetResult();
          }}
          sx={{
            width: {
              xs: '100%',
              lg: 200,
            },
          }}
          renderInput={params => <TextField {...params} label="Varış Ülkesi" placeholder="Ülke ara..." />}
        />

        <TextField
          label="Desi / KG"
          type="number"
          value={weight}
          error={isWeightInvalid}
          helperText={isWeightInvalid ? shippingMessages.WEIGHT.MIN : ''}
          onChange={event => {
            const value = event.target.value;

            setWeight(value === '' ? '' : Number(value));

            resetResult();
          }}
          slotProps={{
            htmlInput: {
              step: 0.1,
              min: 0.1,
            },
          }}
          sx={{
            width: {
              xs: '100%',
              lg: 200,
            },
          }}
        />

        <StyledButton
          type="submit"
          variant="contained"
          loading={isLoading}
          disabled={!canCalculate}
          sx={{
            width: {
              xs: '100%',
              lg: 'auto',
            },
          }}
        >
          Hesapla
        </StyledButton>

        {result !== null && (
          <Typography
            sx={{
              alignSelf: 'center',
              ml: {
                xs: 0,
                lg: 1,
              },
            }}
          >
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
