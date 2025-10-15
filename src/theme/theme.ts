import { createTheme } from "@mui/material/styles";

export const muiTheme = createTheme({
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
          backgroundColor: theme.palette.background.default,
        }),
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: ({ theme }) => ({
          fontWeight: 600,
          color: theme.palette.text.primary,
          borderBottom: `2px solid ${theme.palette.divider}`,
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
