// types/themeType.ts
import { PaletteMode } from '@mui/material';

export interface TPaletteConfig {
  _id?: string;
  mode: PaletteMode;
  primary: {
    main: string;
    contrastText: string;
  };
  secondary: {
    main: string;
    contrastText: string;
  };
  background: {
    default: string;
    paper: string;
  };
  text: {
    primary: string;
    secondary: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Palette {
  mode: PaletteMode;
  customName: string; 
  primary: string;
  secondary: string;
  background: string;
  text: string;
  title: string;
}