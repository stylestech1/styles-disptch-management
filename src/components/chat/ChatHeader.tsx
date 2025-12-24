"use client";
import { Conversation } from "@/types/chatType";
import { RootState, useAppSelector } from "@/redux/store";
import { Avatar } from "./ui/Avatar";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { useUsersInfinite } from "@/hook/chatSys/useUsersInfinite";

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

  const isOnline = useAppSelector((state) =>
    otherMember ? state.chat.presence[otherMember.id]?.isOnline : false
  );

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
        bgcolor: theme.currentPalette.primary,
        px: 2,
        py: 3.5,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            name={otherMember?.name || "user"}
            size="lg"
            status={isOnline ? "online" : "offline"}
            style={{
              bgcolor: theme.currentPalette.background,
              color: theme.currentPalette.secondary,
            }}
          />

          <Box className="flex items-start gap-3">
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography
                  variant="subtitle1"
                  fontWeight="600"
                  color={theme.currentPalette.background}
                >
                  {otherMember?.name || "unknown user"}
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography
                  variant="body2"
                  color={theme.currentPalette.background}
                >
                  {isOnline ? "online" : "offline"}
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

            <Stack direction="row" alignItems="center" sx={{mt: 0.5}}>
              {otherUser?.role && (
                <Chip
                  label={otherUser.role}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    height: 20,
                    color: theme.currentPalette.primary,
                    bgcolor: theme.currentPalette.background,
                    "& .MuiChip-label": {
                      px: 1,
                    },
                  }}
                />
              )}
            </Stack>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
};
