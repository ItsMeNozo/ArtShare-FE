import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    mountain: {
      100: string;
      400: string;
    };
  }

  interface PaletteOptions {
    mountain?: {
      100: string;
      400: string;
    };
  }
}
