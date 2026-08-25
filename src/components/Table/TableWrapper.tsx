import { Box } from '@mui/material';
import type { ReactNode } from 'react';

type TableWrapperProps = {
  children: ReactNode;
};

const TableWrapper = ({ children }: TableWrapperProps) => {
  return (
    <Box
      sx={{
        width: '100%',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </Box>
  );
};

export default TableWrapper;
