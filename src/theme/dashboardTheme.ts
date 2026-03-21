import { createTheme } from '@mui/material/styles';
import { trTR } from '@mui/x-data-grid/locales';

const getDashboardTheme = (mode: 'light' | 'dark') => {
  const sidebarColor = mode === 'light' ? '#ffffff' : '#1F1F21';
  const contentColor = mode === 'light' ? '#F4F4F7' : '#161618';
  const scrollThumbColor = mode === 'light' ? '#D1D1D1' : '#4A4A4E';
  const scrollHoverColor = mode === 'light' ? '#A1A1A1' : '#606065';
  const borderColor = mode === 'light' ? '#EFEFEF' : '#FFFFFF1A';

  return createTheme(
    {
      palette: {
        mode,
        dashboard: {
          sidebar: sidebarColor,
          content: contentColor,
          textSidebar: mode === 'light' ? '#57575A' : '#A6A5B2',
          border: borderColor,
        },
      },
      typography: {
        fontFamily: 'Inter, sans-serif',
      },
      components: {
        MuiTextField: {
          defaultProps: {
            size: 'small',
          },
        },
        MuiSelect: {
          defaultProps: {
            size: 'small',
          },
        },
        MuiInputAdornment: {
          styleOverrides: {
            root: {
              '& .MuiSvgIcon-root': {
                fontSize: 18,
              },
            },
          },
        },
        MuiCssBaseline: {
          styleOverrides: {
            '*::-webkit-scrollbar': {
              width: '10px',
              height: '10px',
            },
            '*::-webkit-scrollbar-track': {
              backgroundColor: contentColor,
            },
            '*::-webkit-scrollbar-thumb': {
              backgroundColor: scrollThumbColor,
              borderRadius: '10px',
              border: `2px solid ${sidebarColor}`,
              '&:hover': {
                backgroundColor: scrollHoverColor,
              },
            },
            '*': {
              scrollbarWidth: 'thin',
              scrollbarColor: `${scrollThumbColor} transparent`,
            },
            'html, body': {
              margin: 0,
              padding: 0,
              overflowX: 'hidden',
            },
          },
        },
      },
    },
    trTR,
  );
};

export default getDashboardTheme;
