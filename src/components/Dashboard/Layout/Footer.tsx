import GitHubIcon from '@mui/icons-material/GitHub';
import { Box, Link, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box sx={{ textAlign: 'center', py: 2 }}>
      <Typography variant="body2">
        MYD Export © {new Date().getFullYear()} –{' '}
        <Link href="https://github.com/NecatiCoskuncopur" target="_blank" rel="noreferrer" underline="hover">
          <GitHubIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
          Coded by Necati Coşkunçopur
        </Link>
      </Typography>
    </Box>
  );
};

export default Footer;
