import { Palette, TPaletteConfig } from "@/types/themeType";

export const paletteToPaletteConfig = (p: Palette): TPaletteConfig => ({
  mode: p.mode,
  customName: p.customName,
  primary: {
    main: p.primary,
    contrastText: "#fff",
  },
  secondary: {
    main: p.secondary,
    contrastText: "#fff",
  },
  background: {
    default: p.background,
    paper: "#fff",
  },
  text: {
    primary: p.text,
    secondary: "#333",
  },
  title: p.title,
  _id: p._id,
});

export const TPaletteConfigToPalette = (p: TPaletteConfig) : Palette => ({
    mode: p.mode,
    customName: p.customName,
    primary: p.primary.main,
    secondary: p.secondary.main,
    background: p.background.default,
    text: p.text.primary,
    title: p.title,
    _id: p._id
})