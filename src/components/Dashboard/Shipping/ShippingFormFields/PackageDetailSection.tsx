'use client';

import React, { useState } from 'react';

import CalculateIcon from '@mui/icons-material/Calculate';
import { Button, Grid, Popover, TextField } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

import { shippingMessages } from '@/constants';
import DesiKgCalculator from './DesiKgCalculator'; // Yukarıdaki dosya
import ErrorTooltip from './ErrorToolTip';
import Wrapper from './Wrapper';

const { HEIGHT, LENGTH, NUMBEROFPACKAGE, WEIGHT, WIDTH } = shippingMessages;

const PackageDetailSection = () => {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<ShippingTypes.ICreateShippingPayload>();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleOpenCalc = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseCalc = () => {
    setAnchorEl(null);
  };

  const handleCalculateResult = (value: number) => {
    setValue('package.weight', value, { shouldValidate: true });
    handleCloseCalc();
  };

  return (
    <Wrapper title="Paket Bilgileri">
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: 3 }}>
          <Controller
            name="package.weight"
            rules={{
              required: WEIGHT.REQUIRED,
              min: { value: 0.1, message: WEIGHT.MIN },
            }}
            control={control}
            render={({ field }) => (
              <ErrorTooltip message={errors.package?.weight?.message}>
                <TextField {...field} type="number" label="Kg/Desi *" fullWidth error={!!errors.package?.weight} />
              </ErrorTooltip>
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <Controller
            name="package.width"
            rules={{
              required: WIDTH.REQUIRED,
              min: { value: 0.5, message: WIDTH.MIN },
              max: { value: 500, message: WIDTH.MAX },
            }}
            control={control}
            render={({ field }) => (
              <ErrorTooltip message={errors.package?.width?.message}>
                <TextField {...field} type="number" label="En (cm) *" fullWidth error={!!errors.package?.width} />
              </ErrorTooltip>
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <Controller
            name="package.height"
            control={control}
            rules={{
              required: HEIGHT.REQUIRED,
              min: { value: 0.5, message: HEIGHT.MIN },
              max: { value: 500, message: HEIGHT.MAX },
            }}
            render={({ field }) => (
              <ErrorTooltip message={errors.package?.height?.message}>
                <TextField {...field} type="number" label="Boy (cm) *" fullWidth error={!!errors.package?.height} />
              </ErrorTooltip>
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Controller
            name="package.length"
            control={control}
            rules={{
              required: LENGTH.REQUIRED,
              min: { value: 0.5, message: LENGTH.MIN },
              max: { value: 500, message: LENGTH.MAX },
            }}
            render={({ field }) => (
              <ErrorTooltip message={errors.package?.length?.message}>
                <TextField {...field} type="number" label="Yükseklik (cm) *" fullWidth error={!!errors.package?.length} />
              </ErrorTooltip>
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <Controller
            name="package.numberOfPackage"
            control={control}
            rules={{
              required: NUMBEROFPACKAGE.REQUIRED,
              min: { value: 1, message: NUMBEROFPACKAGE.MIN },
              max: { value: 55, message: NUMBEROFPACKAGE.MAX },
            }}
            render={({ field }) => (
              <ErrorTooltip message={errors.package?.numberOfPackage?.message}>
                <TextField {...field} type="number" label="Adet *" fullWidth error={!!errors.package?.numberOfPackage} />
              </ErrorTooltip>
            )}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Button variant="outlined" startIcon={<CalculateIcon />} onClick={handleOpenCalc} sx={{ textTransform: 'none' }}>
            Kg/Desi Hesaplayıcı
          </Button>

          <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={handleCloseCalc} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
            <DesiKgCalculator onCalculate={handleCalculateResult} />
          </Popover>
        </Grid>
      </Grid>
    </Wrapper>
  );
};

export default PackageDetailSection;
