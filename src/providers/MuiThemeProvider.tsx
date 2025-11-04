"use client";
import { useSelector } from "react-redux";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { RootState } from "@/redux/store";

export default function MuiThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSelector((state: RootState) => state.palette);

  const muiTheme = createTheme({
    palette: {
      primary: { main: theme.primary },
      secondary: { main: theme.secondary },
      background: { default: theme.background },
      text: { primary: theme.text },
    },
    typography: {
      h1: { color: theme.title, fontWeight: 700 },
    },
  });

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
