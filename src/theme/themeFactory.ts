import { TPaletteConfig } from "@/types/themeType";
import { createTheme } from "@mui/material/styles";

export const createMuiThemeFromPalette = (p: TPaletteConfig) => {
  return createTheme({
    palette: {
      mode: p.mode ?? "light",
      primary: {
        main: p.primary?.main ?? "#1976d2",
        contrastText: p.primary?.contrastText ?? "#fff",
      },
      secondary: {
        main: p.secondary?.main ?? "#9c27b0",
        contrastText: p.secondary?.contrastText ?? "#fff",
      },
      background: {
        default: p.background?.default ?? "#fafafa",
        paper: p.background?.paper ?? "#fff",
      },
      text: {
        primary: p.text?.primary ?? "#000",
        secondary: p.text?.secondary ?? "#333",
      },
    },
    typography: {
      fontFamily: "Cairo, Roboto, sans-serif",
    },
  });
};
