import { RootState, useAppSelector } from "@/redux/store";
import { alpha, AppBar, Box, Toolbar, Typography } from "@mui/material";

import NotificationProvider from "@/providers/NotificationProvider";

export default function Navbar({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const theme = useAppSelector((state: RootState) => state.palette);

  return (
    <AppBar
      position="static"
      sx={{
        borderBottom: 1,
        bgcolor: theme.currentPalette.background,
        borderColor: alpha(theme.currentPalette.text, 0.1),
        color: theme.currentPalette.text,
        boxShadow: "none",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 3,
        }}
      >
        {/* Left Side */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box>
            <Typography
              variant="h1"
              sx={{
                fontWeight: "bold",
                color: theme.currentPalette.primary,
                fontSize: "24px",
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                sx={{
                  color: theme.currentPalette.text,
                  fontSize: "14px",
                  width: 700,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Right Side */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <NotificationProvider />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
