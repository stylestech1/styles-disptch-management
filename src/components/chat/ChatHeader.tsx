"use client";
import { Conversation } from "@/types/chatType";
import { RootState, useAppSelector } from "@/redux/store";
import { Avatar } from "./ui/Avatar";
import { alpha, Box, Chip, Stack, Typography } from "@mui/material";
import { useUsersInfinite } from "@/hook/chatSys/useUsersInfinite";
import { formatLastSeen } from "@/utils/formatLastSeen";

interface ChatHeaderProps {
  conversation: Conversation;
}

export const ChatHeader = ({ conversation }: ChatHeaderProps) => {
  const theme = useAppSelector((state: RootState) => state.palette);
  const currentUserId = useAppSelector(
    (state: RootState) => state.auth.user?.id
  );
  const otherMember = conversation.members.find(
    (member) => member.id !== currentUserId
  );
  const presenceList = useAppSelector(
    (state: RootState) => state.chat.presence
  );

  const userPresence = otherMember ? presenceList[otherMember.id] : undefined;

  const isUserOnline = userPresence?.isOnline ?? false;
  const lastSeen = userPresence?.lastSeen;

  // Other Users
  const { users } = useUsersInfinite(100);
  const otherUser = users?.find((user) => user.id === otherMember?.id);

  // Typing indicator
  const isTyping = useAppSelector(
    (state) => state.chat.typing[conversation.id]
  );

  return (
    <Box
      sx={{
        bgcolor: theme.currentPalette.background,
        borderBottom: `1px solid ${theme.currentPalette.primary}`,
        px: 2,
        py: 3.5,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            name={otherMember?.name || "user"}
            size="lg"
            status={isUserOnline ? "online" : "offline"}
            style={{
              bgcolor: theme.currentPalette.primary,
              color: theme.currentPalette.background,
            }}
          />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography
                variant="subtitle1"
                fontWeight="600"
                color={theme.currentPalette.primary}
              >
                {otherMember?.name || "unknown user"}
              </Typography>

              {otherUser?.role && (
                <Chip
                  label={otherUser.role}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    height: 20,
                    color: theme.currentPalette.background,
                    bgcolor: theme.currentPalette.primary,
                    borderRadius: 1,
                    "& .MuiChip-label": {
                      px: 1,
                    },
                  }}
                />
              )}
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography
                variant="body2"
                color={alpha(theme.currentPalette.primary, 0.7)}
              >
                {isUserOnline ? "online" : formatLastSeen(lastSeen)}
              </Typography>

              {isTyping && (
                <Typography
                  variant="body2"
                  color="primary.main"
                  sx={{ animation: "pulse 1s infinite" }}
                >
                  ...
                </Typography>
              )}
            </Stack>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
};
