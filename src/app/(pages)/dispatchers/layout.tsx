"use client";
import { usePathname, useRouter } from "next/navigation";
import {
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Divider,
  Button,
  useTheme,
  useMediaQuery,
  Avatar,
  CircularProgress,
  Link,
} from "@mui/material";
import {
  IoLogOutOutline,
  IoPersonCircleOutline,
  IoMenu,
} from "react-icons/io5";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector, RootState } from "@/redux/store";
import { logout } from "@/redux/slices/authSlice";
import { TABS_CONFIG } from "@/constants/tabs";
import { useGoogleMaps } from "@/hook/useGoogleMaps";

const DRAWER_WIDTH = 300;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md")); 
  const pathname = usePathname();
  const user = useAppSelector((state: RootState) => state.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(isDesktop);

  // Google hook
  const isGoogleMapsLoaded = useGoogleMaps();

  // Sync sidebar when breakpoint changes
  useEffect(() => {
    setIsSidebarOpen(isDesktop);
  }, [isDesktop]);

  if (!user) return null;

  const tabs = TABS_CONFIG[user.role];
  const base = "/dispatchers";

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/");
  };

  const SidebarContent = (
    <Box
      sx={{
        width: DRAWER_WIDTH,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: theme.palette.background.paper,
        color: theme.palette.text.primary,
      }}
    >
      {/* User Header */}
      <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
            <IoPersonCircleOutline />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={600} noWrap>
              {user.name}
            </Typography>
            <div className="flex items-center gap-2">
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  textTransform: "capitalize",
                }}
              >
                {user.role}
              </Typography>
            </div>
          </Box>
        </Box>
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, overflowY: "auto", py: 1 }}>
        {tabs.map(({ label, icon }, i) => {
          const link = `${base}/${label.toLowerCase()}`;
          const active = pathname.startsWith(link);
          return (
            <ListItemButton
              key={i}
              component={Link}
              href={link}
              onClick={() => !isDesktop && setIsSidebarOpen(false)}
              sx={{
                borderRadius: 2,
                mx: 1,
                my: 0.5,
                backgroundColor: active
                  ? theme.palette.primary.main
                  : "transparent",
                color: active
                  ? theme.palette.primary.contrastText || "#fff"
                  : theme.palette.text.primary,
                "&:hover": {
                  backgroundColor: active
                    ? theme.palette.primary.dark
                    : theme.palette.action.hover,
                },
              }}
            >
              <ListItemIcon sx={{ color: "inherit" }}>{icon}</ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          );
        })}
      </List>

      {/* Logout */}
      <Divider />
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          startIcon={<IoLogOutOutline />}
          variant="contained"
          color="secondary"
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            py: 1,
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Sidebar Drawer */}
      <Drawer
        variant={isDesktop ? "permanent" : "temporary"}
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 2,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            bgcolor: theme.palette.background.default,
            borderRight: `1px solid ${theme.palette.divider}`,
            boxShadow: isDesktop ? "none" : undefined,
          },
        }}
      >
        {SidebarContent}
      </Drawer>

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: isDesktop ? `${DRAWER_WIDTH}px` : 0,
          width: isDesktop ? `calc(100% - ${DRAWER_WIDTH}px)` : "100%",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          bgcolor: theme.palette.background.default,
        }}
      >
        {!isDesktop && (
          <AppBar
            position="fixed"
            sx={{
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              boxShadow: 1,
              zIndex: (t) => t.zIndex.drawer + 1,
            }}
          >
            <Toolbar>
              <IconButton
                edge="start"
                onClick={() => setIsSidebarOpen(true)}
                sx={{ mr: 2 }}
                aria-label="open menu"
              >
                <IoMenu size={22} />
              </IconButton>
            </Toolbar>
          </AppBar>
        )}

        {!isDesktop && <Box sx={theme.mixins.toolbar} />}

        {/* Page content */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            p: { xs: 3, md: 4 },
          }}
        >
          {isGoogleMapsLoaded ? (
            children
          ) : (
            <Box
              sx={{
                height: "60vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress color="primary" />
              <Typography sx={{ mt: 2, color: theme.palette.text.secondary }}>
                Loading Google Maps...
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
