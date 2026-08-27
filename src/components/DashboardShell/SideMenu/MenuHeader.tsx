import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Box, IconButton, Typography } from '@mui/material';

type MenuHeaderProps = {
  isExpanded: boolean;
  onToggle: () => void;
};

const MenuHeader = ({ isExpanded, onToggle }: MenuHeaderProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isExpanded ? 'space-between' : 'center',
        p: 2,
        minHeight: 64,
      }}
    >
      {isExpanded && (
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          MYD Export
        </Typography>
      )}

      <IconButton
        sx={{
          color: '#A6A5B2',
        }}
        type="button"
        onClick={onToggle}
        aria-label={isExpanded ? 'Menüyü daralt' : 'Menüyü genişlet'}
      >
        {isExpanded ? <ChevronLeft /> : <ChevronRight />}
      </IconButton>
    </Box>
  );
};

export default MenuHeader;
