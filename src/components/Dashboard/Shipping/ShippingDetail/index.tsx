'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { Alert, Box, CircularProgress, Grid, useTheme } from '@mui/material';

import getShipping from '@/app/actions/shipping/getShipping';
import { generalMessages, shippingMessages } from '@/constants';
import ConsigneeSection from './ConsigneeSection';
import ContentSection from './ContentSection';
import Header from './Header';
import SenderSection from './SenderSection';
import ShippingDetailSection from './ShippingDetailSection';

const { NOT_FOUND } = shippingMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const ShippingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const [shipping, setShipping] = useState<ShippingTypes.IShipping | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShipping = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const response = await getShipping(id);

        if (response.status === 'OK' && response.data) {
          setShipping(response.data);
        } else {
          setError(response.message || NOT_FOUND);
        }
      } catch {
        setError(UNEXPECTED_ERROR);
      } finally {
        setLoading(false);
      }
    };

    fetchShipping();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
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
    <>
      <Box
        sx={{
          width: '100%',
          backgroundColor: theme.palette.dashboard.sidebar,
          color: theme.palette.dashboard.textSidebar,
          p: '24px',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
        }}
      >
        <Header hasTrackingNumber={!!shipping?.carrier?.trackingNumber} id={id} />
      </Box>

      <Grid container spacing={2} sx={{ mt: '24px' }}>
        <Grid
          sx={{
            borderRadius: '12px',
            backgroundColor: theme.palette.dashboard.sidebar,
            color: theme.palette.dashboard.textSidebar,
            p: '24px',
          }}
          size={{ xs: 12, md: 6 }}
        >
          <SenderSection sender={shipping?.sender} />
        </Grid>
        <Grid
          sx={{
            borderRadius: '12px',
            backgroundColor: theme.palette.dashboard.sidebar,
            color: theme.palette.dashboard.textSidebar,
            p: '24px',
          }}
          size={{ xs: 12, md: 6 }}
        >
          <ConsigneeSection consignee={shipping?.consignee} />
        </Grid>
        <Grid
          sx={{
            borderRadius: '12px',
            backgroundColor: theme.palette.dashboard.sidebar,
            color: theme.palette.dashboard.textSidebar,
            p: '24px',
          }}
          size={{ xs: 12, md: 6 }}
        >
          <ShippingDetailSection
            detail={shipping?.detail}
            currency={shipping?.content?.currency}
            numberOfPackage={shipping?.package?.numberOfPackage}
            createdAt={shipping?.createdAt}
          />
        </Grid>
        <Grid
          sx={{
            borderRadius: '12px',
            backgroundColor: theme.palette.dashboard.sidebar,
            color: theme.palette.dashboard.textSidebar,
            p: '24px',
          }}
          size={{ xs: 12, md: 6 }}
        >
          <ContentSection products={shipping?.content?.products} currency={shipping?.content?.currency} />
        </Grid>
      </Grid>
    </>
  );
};

export default ShippingDetail;
