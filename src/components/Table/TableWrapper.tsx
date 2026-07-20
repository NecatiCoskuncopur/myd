import React from 'react';

import { Box } from '@mui/material';

type TableWrapperProps = {
  children: React.ReactNode;
};

const TableWrapper = ({ children }: TableWrapperProps) => {
  return (
    <Box
      sx={{
        width: '100%',
        flex: 1,
        minHeight: 0,
        overflowX: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          minWidth: 1200,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default TableWrapper;
