'use client';

import React, { useEffect, useState } from 'react';

import CalculateIcon from '@mui/icons-material/Calculate';
import { Button, Grid, Popover, TextField } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

import { shippingMessages } from '@/constants';
import DesiKgCalculator from './DesiKgCalculator';
import ErrorTooltip from './ErrorToolTip';
import Wrapper from './Wrapper';

const { HEIGHT, LENGTH, NUMBEROFPACKAGE, WEIGHT, WIDTH } = shippingMessages;

const PackageDetailSection = () => {
  const {
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<ShippingTypes.ICreateShippingPayload>();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const width = watch('package.width');
  const height = watch('package.height');
  const length = watch('package.length');
  const piece = watch('package.numberOfPackage');

  useEffect(() => {
    if (width && height && length) {
      const w = Number(width);
      const h = Number(height);
      const l = Number(length);
      const p = Number(piece) || 1;

      const calculatedVolumetric = ((w * h * l) / 5000) * p;
      setValue('package.volumetricWeight', Number(calculatedVolumetric.toFixed(2)));
    }
  }, [width, height, length, piece, setValue]);

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
                <TextField {...field} type="number" label="Kg *" fullWidth error={!!errors.package?.weight} />
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
            }}
            render={({ field }) => (
              <ErrorTooltip message={errors.package?.height?.message}>
                <TextField {...field} type="number" label="Boy (cm) *" fullWidth error={!!errors.package?.height} />
              </ErrorTooltip>
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <Controller
            name="package.length"
            control={control}
            rules={{
              required: LENGTH.REQUIRED,
              min: { value: 0.5, message: LENGTH.MIN },
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
