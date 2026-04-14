'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { Alert, Box, CircularProgress } from '@mui/material';

import getShipping from '@/app/actions/shipping/getShipping';
import { generalMessages, shippingMessages } from '@/constants';

const { NOT_FOUND } = shippingMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const ShippingDetail = () => {
  const { id } = useParams<{ id: string }>();

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

  console.log(shipping);

  return <div>sa</div>;
};

export default ShippingDetail;
