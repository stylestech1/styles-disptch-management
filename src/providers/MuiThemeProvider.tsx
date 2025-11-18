"use client";
import { useSelector } from "react-redux";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { RootState, useAppDispatch } from "@/redux/store";
import { useEffect, useMemo } from "react";
import { useGetPaletteQuery } from "@/redux/slices/apiSlice";
import { loadPalettesFromBackend, setPalette } from "@/redux/slices/paletteSlice";
import { TPaletteConfigToPalette } from "@/utils/helperPalette";

export default function MuiThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentPalette } = useSelector((state: RootState) => state.palette);
  const dispatch = useAppDispatch();

  const { data: backendPalettes = [] } = useGetPaletteQuery();

  useEffect(() => {
    if (backendPalettes.length > 0) {
      dispatch(loadPalettesFromBackend(backendPalettes));

      const activePaletteConfig = backendPalettes.find(p => p.active);
      if (activePaletteConfig) {
        const activePalette = TPaletteConfigToPalette(activePaletteConfig);
        dispatch(setPalette(activePalette));
      }
    }
  }, [backendPalettes, dispatch]);

  const muiTheme = useMemo(() => {
    return createTheme({
      palette: {
        mode: currentPalette.mode,
        primary: { 
          main: currentPalette.primary,
          contrastText: "#FFFFFF"
        },
        secondary: { 
          main: currentPalette.secondary,
          contrastText: "#FFFFFF" 
        },
        background: { 
          default: currentPalette.background,
          paper: "#FFFFFF" 
        },
        text: { 
          primary: currentPalette.text,
          secondary: "#666666"
        },
      },
    });
  }, [currentPalette]);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}