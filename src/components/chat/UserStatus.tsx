"use client";
import { RootState, useAppSelector } from "@/redux/store";
import { socketService } from "@/services/socketService";
import { Avatar } from "./ui/Avatar";
import { Stack, Typography } from "@mui/material";

export const UserStatus = () => {
  const user = useAppSelector((state) => state.auth.user);
  const theme = useAppSelector((state: RootState) => state.palette);
  const isConnected = useAppSelector((state) =>
    socketService.getConnectionStatus()
  );

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar
          name={user?.name?.[0] || "U"}
          size="lg"
          status={isConnected ? "online" : "offline"}
          style={{
            bgcolor: theme.currentPalette.background,
            color: theme.currentPalette.secondary,
          }}
        />
        <div>
          <Stack direction="column" alignItems="start" spacing={0}>
            <Typography
              variant="subtitle1"
              fontWeight="600"
              color={theme.currentPalette.background}
            >
              {user?.name || "unknown user"}
            </Typography>
            <Typography variant="body2" color={theme.currentPalette.background}>
              {isConnected ? "online" : "offline"}
            </Typography>
          </Stack>
        </div>
      </div>
    </div>
  );
};
