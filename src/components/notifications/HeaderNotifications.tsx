"use client";
import { useState, useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch, RootState } from "@/redux/store";
import { apiSlice } from "@/redux/slices/apiSlice";
import { TNotification } from "@/types/notificationType";
import toast from "react-hot-toast";
import { addNotification } from "@/redux/slices/notificationSlice";
import {
  alpha,
  Box,
  Button,
  Badge,
  IconButton,
  Typography,
  List,
  ListItemText,
  ListItemButton,
  Divider,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { IoMdNotifications } from "react-icons/io";
import { Close, MarkEmailRead } from "@mui/icons-material";

export default function HeaderNotifications() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(
    (state: RootState) => state.notifications.list
  );
  const token = useAppSelector((state: RootState) => state.auth.token);
  const theme = useAppSelector((state: RootState) => state.palette);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  const { data, refetch } = apiSlice.endpoints.getAllNotifications.useQuery(
    undefined,
    {
      skip: !token,
    }
  );

  // 🔊 Audio setup
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [markAllAsRead] = apiSlice.endpoints.markAllAsRead.useMutation();

  // Initialize audio after first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!audioRef.current) {
        audioRef.current = new Audio("/audio/notify.wav");
        audioRef.current.volume = 0.5;
      }
      setAudioInitialized(true);
      document.removeEventListener("click", handleFirstInteraction);
    };

    document.addEventListener("click", handleFirstInteraction);

    return () => document.removeEventListener("click", handleFirstInteraction);
  }, []);

  // Add new notifications to redux and play sound
  useEffect(() => {
    if (data?.data) {
      data.data.forEach((notif: TNotification) => {
        const exists = notifications.find((n) => n.id === notif.id);
        if (!exists) {
          dispatch(addNotification(notif));
          if (notif.status === "unread" && audioInitialized && audioRef.current) {
            audioRef.current
              .play()
              .catch((err) => console.warn("Audio play error:", err));
          }
        }
      });
    }
  }, [data, dispatch, notifications, audioInitialized]);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead(null).unwrap(); 
      refetch()
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark notifications as read");
    }
  };

  const handleNotificationClick = (notification: TNotification) => {
    setDropdownOpen(false);
  };

  return (
    <Box sx={{ position: "relative", display: "inline-block" }}>
      <IconButton
        size="large"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        sx={{
          color: theme.currentPalette.primary,
          "&:hover": {
            backgroundColor: alpha(theme.currentPalette.primary, 0.1),
          },
        }}
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          overlap="circular"
          sx={{
            "& .MuiBadge-badge": {
              fontSize: "0.7rem",
              height: "18px",
              minWidth: "18px",
            },
          }}
        >
          <IoMdNotifications size={isMobile ? 20 : 25} />
        </Badge>
      </IconButton>

      {dropdownOpen && (
        <Paper
          elevation={8}
          sx={{
            position: "absolute",
            right: 0,
            top: "100%",
            width: isMobile ? 300 : 380,
            maxHeight: 400,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            zIndex: 50,
            backgroundColor: theme.currentPalette.background,
            border: `1px solid ${alpha(theme.currentPalette.text, 0.2)}`,
            borderRadius: 1,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: `1px solid ${alpha(theme.currentPalette.text, 0.2)}`,
              backgroundColor: theme.currentPalette.background,
              flexShrink: 0, 
            }}
          >
            <Typography variant="h6" component="h2" fontWeight="bold">
              Notifications
              {unreadCount > 0 && (
                <Typography
                  component="span"
                  sx={{
                    ml: 1,
                    color: theme.currentPalette.primary,
                    fontSize: "0.8rem",
                  }}
                >
                  ({unreadCount} unread)
                </Typography>
              )}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setDropdownOpen(false)}
              sx={{ color: theme.currentPalette.text }}
            >
              <Close />
            </IconButton>
          </Box>

          {/* Notifications List  */}
          <Box 
            sx={{ 
              flex: 1, 
              overflow: "auto",
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: alpha(theme.currentPalette.text, 0.1),
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: alpha(theme.currentPalette.text, 0.3),
                borderRadius: '4px',
                '&:hover': {
                  background: alpha(theme.currentPalette.text, 0.5),
                },
              },
            }}
          >
            {notifications.length === 0 ? (
              <Box
                sx={{
                  p: 3,
                  textAlign: "center",
                  color: alpha(theme.currentPalette.text, 0.6),
                }}
              >
                <Typography variant="body2">No notifications</Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {notifications.map((notification, index) => (
                  <Box key={notification.id}>
                    <ListItemButton
                      onClick={() => handleNotificationClick(notification)}
                      sx={{
                        py: 1.5,
                        px: 2,
                        backgroundColor:
                          notification.status === "unread"
                            ? alpha(theme.currentPalette.primary, 0.08)
                            : "transparent",
                        "&:hover": {
                          backgroundColor:
                            notification.status === "unread"
                              ? alpha(theme.currentPalette.primary, 0.12)
                              : alpha(theme.currentPalette.primary, 0.04),
                        },
                        borderLeft:
                          notification.status === "unread"
                            ? `3px solid ${theme.currentPalette.primary}`
                            : "3px solid transparent",
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography
                            variant="subtitle2"
                            component="div"
                            sx={{
                              fontWeight: notification.status === "unread" ? 600 : 400,
                              color: theme.currentPalette.text,
                            }}
                          >
                            {notification.title}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            variant="body2"
                            sx={{
                              color: alpha(theme.currentPalette.text, 0.7),
                              mt: 0.5,
                            }}
                          >
                            {notification.message}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                    {index < notifications.length - 1 && <Divider variant="inset" component="li" />}
                  </Box>
                ))}
              </List>
            )}
          </Box>

          {/* Footer */}
          {notifications.length > 0 && (
            <Box
              sx={{
                p: 1,
                borderTop: `1px solid ${alpha(theme.currentPalette.text, 0.2)}`,
                backgroundColor: theme.currentPalette.background,
                flexShrink: 0, 
              }}
            >
              <Button
                fullWidth
                startIcon={<MarkEmailRead />}
                onClick={handleMarkAllAsRead}
                sx={{
                  color: theme.currentPalette.primary,
                  "&:hover": {
                    backgroundColor: alpha(theme.currentPalette.primary, 0.1),
                    color: theme.currentPalette.primary,
                  },
                  justifyContent: "flex-start",
                  pl: 2,
                  textTransform: "none",
                  fontWeight: 500,
                }}
              >
                Mark all as read
              </Button>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
}