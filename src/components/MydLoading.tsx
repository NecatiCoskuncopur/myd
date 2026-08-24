'use client';

import { Box } from '@mui/material';

const MydLoading = () => {
  return (
    <Box
      style={{
        position: 'absolute',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#fff',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <object type="image/svg+xml" data="/images/mydLoading.svg" width="15%">
        Yükleniyor...
      </object>
    </Box>
  );
};

export default MydLoading;
