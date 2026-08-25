'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Alert, Box, CircularProgress, Grid, useTheme } from '@mui/material';

import getShipping from '@/app/actions/shipping/getShipping';
import { generalMessages, shippingMessages } from '@/constants';
import { ShippingTypes } from '@/types/shipping';

import ConsigneeSection from './ConsigneeSection';
import ContentSection from './ContentSection';
import Header from './Header';
import SenderSection from './SenderSection';
import ShippingDetailSection from './ShippingDetailSection';

const { NOT_FOUND } = shippingMessages;
const { UNEXPECTED_ERROR } = generalMessages;

type ShippingDetailProps = {
  canCreateBarcode: boolean;
};

const ShippingDetail = ({ canCreateBarcode }: ShippingDetailProps) => {
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();

  const [shipping, setShipping] = useState<ShippingTypes.IShipping | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    const fetchShipping = async () => {
      if (!id) {
        setShipping(null);
        setErrorMessage(NOT_FOUND);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await getShipping(id);

        if (!isActive) {
          return;
        }

        if (response.status === 'ERROR' || !response.data) {
          setShipping(null);
          setErrorMessage(response.message || NOT_FOUND);
          return;
        }

        setShipping(response.data);
      } catch {
        if (!isActive) {
          return;
        }

        setShipping(null);
        setErrorMessage(UNEXPECTED_ERROR);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchShipping();

    return () => {
      isActive = false;
    };
  }, [id, refreshKey]);

  const handleShippingRefresh = () => {
    setRefreshKey(current => current + 1);
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (errorMessage) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {errorMessage}
      </Alert>
    );
  }

  if (!shipping) {
    return null;
  }

  const sectionSx = {
    borderRadius: '12px',
    backgroundColor: theme.palette.dashboard.sidebar,
    color: theme.palette.dashboard.textSidebar,
    p: 3,
  };

  return (
    <>
      <Box
        sx={{
          ...sectionSx,
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          flexDirection: {
            xs: 'column',
            sm: 'row',
          },
          alignItems: {
            xs: 'flex-start',
            sm: 'center',
          },
          gap: 2,
        }}
      >
        <Header id={id} shipping={shipping} canCreateBarcode={canCreateBarcode} onShippingRefresh={handleShippingRefresh} />
      </Box>

      <Grid container spacing={2} sx={{ mt: 3 }}>
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{
            ...sectionSx,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          Taşıyıcı Hesabı: {shipping.carrier?.displayName || 'Henüz barkod oluşturulmadı.'}
        </Grid>

        <Grid size={{ xs: 12, md: 6 }} sx={sectionSx}>
          Takip Numarası: {shipping.carrier?.trackingNumber || 'Henüz barkod oluşturulmadı.'}
        </Grid>

        <Grid size={{ xs: 12, md: 6 }} sx={sectionSx}>
          <SenderSection sender={shipping.sender} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }} sx={sectionSx}>
          <ConsigneeSection consignee={shipping.consignee} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }} sx={sectionSx}>
          <ShippingDetailSection
            detail={shipping.detail}
            currency={shipping.content?.currency}
            numberOfPackage={shipping.package?.numberOfPackage}
            createdAt={shipping.createdAt}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }} sx={sectionSx}>
          <ContentSection products={shipping.content?.products} currency={shipping.content?.currency} />
        </Grid>
      </Grid>
    </>
  );
};

export default ShippingDetail;
