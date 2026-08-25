import { Box, Typography } from '@mui/material';

type CurrentBalanceProps = {
  total: number;
};

const CurrentBalance = ({ total }: CurrentBalanceProps) => {
  const formattedTotal = Math.round((total + Number.EPSILON) * 100) / 100;

  const balanceColor = total < 0 ? 'error.main' : total > 0 ? 'success.main' : 'text.primary';

  return (
    <Box
      sx={theme => ({
        px: 2.5,
        py: 1.25,
        borderRadius: '12px',
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        alignSelf: {
          xs: 'stretch',
          sm: 'auto',
        },
        justifyContent: {
          xs: 'space-between',
          sm: 'flex-start',
        },
      })}
    >
      <Typography
        variant="caption"
        sx={{
          color: 'text.secondary',
          textTransform: 'uppercase',
          fontWeight: 600,
          letterSpacing: '0.05em',
        }}
      >
        Güncel Bakiye
      </Typography>

      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: balanceColor,
          lineHeight: 1,
        }}
      >
        {formattedTotal}$
      </Typography>
    </Box>
  );
};

export default CurrentBalance;
