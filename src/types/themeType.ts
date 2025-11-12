import { PaletteMode } from '@mui/material';

export interface TPaletteConfig {
  _id?: string;
  mode: PaletteMode;
  customName: string;
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
  title: string
  createdAt?: string;
  updatedAt?: string;
}

export interface Palette {
  _id?: string
  mode: PaletteMode;
  customName: string; 
  primary: string;
  secondary: string;
  background: string;
  text: string;
  title: string;
}

export interface TUpdatePaletteRequest {
  _id: string;
  body: TPaletteConfig;
}
