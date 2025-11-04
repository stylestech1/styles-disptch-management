import { createTheme } from "@mui/material";
import { TPaletteConfig } from "./palettes";

export const createMuiThemeFromPalette = (p: TPaletteConfig) => 
    createTheme({
        palette: {
            mode: p.mode ?? 'light',
            primary: p.primary,
            secondary: p.secondary,
            background: p.background,
            text: p.text
        }
    })
