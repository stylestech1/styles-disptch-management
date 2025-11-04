"use client";
import { RootState, useAppSelector } from "@/redux/store";
import { createMuiThemeFromPalette } from "@/theme/themeFactory";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { useMemo } from "react";

const MuiThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const palette = useAppSelector((state: RootState) => state.palette.palette);
  const theme = useMemo(() => createMuiThemeFromPalette(palette), [palette]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default MuiThemeProvider;
