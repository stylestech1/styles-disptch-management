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
  const theme = useSelector((state: RootState) => state.palette);

  const muiTheme = useMemo(() => {
    return createTheme({
      palette: {
        primary: { main: theme.primary },
        secondary: { main: theme.secondary },
        background: { default: theme.background },
        text: { primary: theme.text },
      },
    });
  }, [theme]);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
