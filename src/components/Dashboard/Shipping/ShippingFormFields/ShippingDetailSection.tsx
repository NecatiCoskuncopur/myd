'use client';

import { Grid, MenuItem, TextField } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

import { shippingMessages } from '@/constants';
import ErrorTooltip from './ErrorToolTip';
import Wrapper from './Wrapper';

const { IOSSNUMBER, PAYOR, PURPOSE } = shippingMessages;

const ShippingDetailSection = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext<ShippingTypes.ICreateShippingPayload | ShippingTypes.IUpdateShippingPayload>();

  return (
    <Wrapper title="Gönderi Detayı">
      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="detail.payor.shipping"
          control={control}
          rules={{
            required: PAYOR.SHIPMENT.TYPE_REQUIRED,
            validate: value => {
              if (value === 'SENDER' || value === 'CONSIGNEE') {
                return true;
              }
              return PAYOR.SHIPMENT.TYPE_INVALID;
            },
          }}
          render={({ field }) => {
            const errorMessage = errors.detail?.payor?.shipping?.message;

            return (
              <ErrorTooltip message={errorMessage}>
                <TextField {...field} select label="Kargo Ücreti *" fullWidth error={!!errorMessage}>
                  <MenuItem value="SENDER">Gönderici</MenuItem>
                  <MenuItem value="CONSIGNEE">Alıcı</MenuItem>
                </TextField>
              </ErrorTooltip>
            );
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="detail.payor.customs"
          control={control}
          rules={{
            required: PAYOR.CUSTOMS.TYPE_REQUIRED,
            validate: value => {
              if (value === 'SENDER' || value === 'CONSIGNEE') {
                return true;
              }
              return PAYOR.CUSTOMS.TYPE_INVALID;
            },
          }}
          render={({ field }) => {
            const errorMessage = errors.detail?.payor?.customs?.message;

            return (
              <ErrorTooltip message={errorMessage}>
                <TextField {...field} select label="Gümrük Ücreti *" fullWidth error={!!errorMessage}>
                  <MenuItem value="SENDER">Gönderici</MenuItem>
                  <MenuItem value="CONSIGNEE">Alıcı</MenuItem>
                </TextField>
              </ErrorTooltip>
            );
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="detail.iossNumber"
          rules={{
            validate: value => {
              if (!value) return true;
              if (value.length !== 12) return IOSSNUMBER.LENGTH;
              return true;
            },
          }}
          control={control}
          render={({ field }) => {
            const errorMessage = errors.detail?.iossNumber?.message;

            return (
              <ErrorTooltip message={errorMessage}>
                <TextField {...field} label="IOSS Numarası" fullWidth error={!!errorMessage} />
              </ErrorTooltip>
            );
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="detail.purpose"
          control={control}
          rules={{
            required: PURPOSE.REQUIRED,
            validate: value => {
              if (value === 'SAMPLE' || value === 'COMMERICAL' || value === 'GIFT' || value === 'PERSONAL' || value === 'REPAIR_OR_RETURN') {
                return true;
              }
              return PURPOSE.INVALID;
            },
          }}
          render={({ field }) => {
            const errorMessage = errors.detail?.purpose?.message;

            return (
              <ErrorTooltip message={errorMessage}>
                <TextField {...field} select label="Gönderi Açıklaması *" fullWidth error={!!errorMessage}>
                  <MenuItem value="SAMPLE">Numune (SAMPLE)</MenuItem>
                  <MenuItem value="COMMERICAL">Ticari (COMMERICAL)</MenuItem>
                  <MenuItem value="GIFT">Hediyelik (GIFT)</MenuItem>
                  <MenuItem value="PERSONAL">Kişisel (PERSONAL)</MenuItem>
                  <MenuItem value="REPAIR_OR_RETURN">REPAIR OR RETURN (Tamirat & İade)</MenuItem>
                </TextField>
              </ErrorTooltip>
            );
          }}
        />
      </Grid>
    </Wrapper>
  );
};

export default ShippingDetailSection;
