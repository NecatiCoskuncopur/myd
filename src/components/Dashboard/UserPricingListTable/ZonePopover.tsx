import { useState } from 'react';

import { Box, Popover, Typography } from '@mui/material';

const ZonePopover = ({ zone, countries }: { zone: number; countries: { name: string; zone: number }[] }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const open = Boolean(anchorEl);

  return (
    <>
      <Typography sx={{ cursor: 'pointer' }} onClick={e => setAnchorEl(e.currentTarget)}>
        {zone}
      </Typography>

      <Popover open={open} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}>
        <Box sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
          {countries
            .filter(c => c.zone === zone)
            .map(c => (
              <Typography key={c.name}>{c.name}</Typography>
            ))}
        </Box>
      </Popover>
    </>
  );
};

export default ZonePopover;
