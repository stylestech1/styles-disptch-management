"use client";
import { useSelector } from "react-redux";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { RootState } from "@/redux/store";
import { useMemo } from "react";

export default function MuiThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentPalette } = useSelector((state: RootState) => state.palette);

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