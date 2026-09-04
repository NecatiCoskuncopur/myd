import { useState } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Box, IconButton, Typography } from '@mui/material';

type MaskedValueCellProps = {
  value: string;
};

const MaskedValueCell = ({ value }: MaskedValueCellProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        width: '100%',
        height: '100%',
      }}
    >
      <Typography
        variant="body2"
        noWrap
        sx={{
          width: '180px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {visible ? value : '**********************'}
      </Typography>

      <IconButton size="small" aria-label={visible ? 'Değeri gizle' : 'Değeri göster'} onClick={() => setVisible(prev => !prev)}>
        {visible ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
      </IconButton>
    </Box>
  );
};

export default MaskedValueCell;
