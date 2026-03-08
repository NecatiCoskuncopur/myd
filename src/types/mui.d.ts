import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    dashboard: {
      sidebar: string;
      content: string;
    };
  }

  interface PaletteOptions {
    dashboard?: {
      sidebar?: string;
      content?: string;
    };
  }
}
