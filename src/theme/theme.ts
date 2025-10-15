import { createTheme } from "@mui/material/styles";

export const muiTheme = createTheme({
 palette: {
    primary: {
      main: '#1d293d', 
    },
  },
  components: {
    MuiTableContainer: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
          boxShadow: theme.shadows[2],
          backgroundColor: theme.palette.background.paper,
        }),
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.primary.main,
        }),
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: ({ theme }) => ({
          fontWeight: 600,
          color: theme.palette.common.white,
          borderBottom: `2px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.primary.main,
        }),
        body: ({ theme }) => ({
          color: theme.palette.text.secondary,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }),
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: ({ theme }) => ({
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
          transition: "background-color 0.2s ease",
          "&:last-child td, &:last-child th": {
            border: 0,
          },
        }),
      },
    },
  },
});