import { Card, CardContent, CardHeader, Grid, useTheme } from '@mui/material';

type WrapperProps = {
  children: React.ReactNode;
  title: string;
};

const Wrapper = ({ children, title }: WrapperProps) => {
  const theme = useTheme();

  return (
    <Card
      variant="elevation"
      sx={{
        borderRadius: 2,
        width: '100%',
        border: `1px solid ${theme.palette.dashboard.border}`,
      }}
    >
      <CardHeader
        title={title}
        titleTypographyProps={{
          fontSize: '18px',
        }}
        sx={{ p: 1, borderBottom: `1px solid ${theme.palette.dashboard.border}` }}
      />
      <CardContent sx={{ p: 1, mt: 1 }}>
        <Grid container size={{ xs: 12 }} spacing={2}>
          {children}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Wrapper;
