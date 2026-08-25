import { Grid, Typography } from '@mui/material';
import type { ReactNode } from 'react';

type DetailRow = {
  label: string;
  value?: ReactNode;
};

type DetailGridProps = {
  rows: DetailRow[];
};

const DetailGrid = ({ rows }: DetailGridProps) => {
  return (
    <Grid container spacing={2} sx={{ mt: 1.5 }}>
      {rows.map(({ label, value }) => (
        <Grid key={label} size={{ xs: 12, sm: 6 }}>
          <Typography variant="caption" color="text.primary">
            {label}
          </Typography>

          <Typography variant="body1" sx={{ fontSize: 14 }}>
            {value || '-'}
          </Typography>
        </Grid>
      ))}
    </Grid>
  );
};

export default DetailGrid;
