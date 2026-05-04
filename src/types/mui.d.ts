import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    dashboard: {
      sidebar: string;
      content: string;
      textSidebar: string;
      border: string;
    };

    auth: {
      content: string;
      card: string;
      textColor: string;
    };
  }

  interface PaletteOptions {
    dashboard?: {
      sidebar?: string;
      content?: string;
      textSidebar?: string;
      border: string;
    };
    auth: {
      content: string;
      card: string;
      textColor: string;
    };
  }
}
