"use client";
import { RootState, useAppSelector } from "@/redux/store";
import { alpha, AppBar, Box, Toolbar, Typography, IconButton } from "@mui/material";
import NotificationProvider from "@/providers/NotificationProvider";
import HeaderSourceTruckDashboard from "../truck/HeaderSourceTruckDashboard";
import { usePathname } from "next/navigation";
import { IoMenu } from "react-icons/io5";
import GlobalFilter from "@/components/ui/GlobalFilter";

interface NavbarProps {
  title: string;
  subtitle: string;
  onMenuClick: () => void;
}

export default function Navbar({ title, subtitle, onMenuClick }: NavbarProps) {
  const theme = useAppSelector((state: RootState) => state.palette);
  const pathname = usePathname();

  const shouldShowFilter = [
    "/admin/loads",
    "/admin/truckdashboard",
    "/admin/driverSummary", 
    "/admin/truckSummary",
    "/admin/trucksmaintenance",
    "admin/drivers",
    "/dispatchers/loads",
  ].some(path => pathname.includes(path));

  const getFilterType = () => {
    if (pathname.includes('loads')) return 'loads';
    if (pathname.includes('driverSummary')) return 'drivers';
    if (pathname.includes('drivers')) return 'drivers';
    if (pathname.includes('truckSummary')) return 'trucks';
    if (pathname.includes('trucksmaintenance')) return 'trucks';
    return 'default';
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        borderBottom: 1,
        bgcolor: theme.currentPalette.background,
        borderColor: alpha(theme.currentPalette.text, 0.1),
        color: theme.currentPalette.text,
        boxShadow: "none",
        top: 0,
        width: 'calc(100% - 300px)',
        zIndex: 10
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: { xs: 2, sm: 3 },
          gap: { xs: 2, sm: 0 },
          px: {xs: 2, sm: 7}
        }}
      >
        {/* Left Side */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: { xs: 1, sm: 0 },
          }}
        >
          {/* Menu Button */}
          <IconButton
            edge="start"
            onClick={onMenuClick}
            aria-label="open menu"
            sx={{ 
              color: theme.currentPalette.text,
              display: { md: 'none' }
            }}
          >
            <IoMenu size={22} />
          </IconButton>

          {/* Logo and Title */}
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
                  width: 500,
                  display: { xs: 'none', md: 'block' } 
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Right Side */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {(pathname === "/admin/truckdashboard" || pathname === "/admin/trucksmaintenance") && (
            <div className="hidden sm:flex"><HeaderSourceTruckDashboard /></div>
          )}
          {shouldShowFilter && (
            <GlobalFilter filterType={getFilterType()} />
          )}
          <NotificationProvider />
        </Box>
      </Toolbar>
    </AppBar>
  );
}