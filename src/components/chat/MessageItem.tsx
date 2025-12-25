"use client";
import { Message } from "@/types/chatType";
import { RootState, useAppSelector } from "@/redux/store";
import { useEffect, useRef } from "react";
import { alpha, Box, Typography } from "@mui/material";
import { useConversations } from "@/hook/chatSys/useConversations";
import { Check, CheckCheck } from "lucide-react";

interface MessageItemProps {
  message: Message;
  conversationId?: string;
}

export const MessageItem = ({ message }: MessageItemProps) => {
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const theme = useAppSelector((state: RootState) => state.palette);
  const { conversations } = useConversations();
  const isOwnMessage = message.sender.id === currentUserId;
  const isSeen = message.seen;
  const hasBeenSeenRef = useRef(false);

  useEffect(() => {
    if (!isOwnMessage && !isSeen && !hasBeenSeenRef.current) {
      hasBeenSeenRef.current = true;
    }
  }, [isOwnMessage, isSeen]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const bgColor = isOwnMessage
    ? theme.currentPalette.primary
    : theme.currentPalette.background;
  const textColor = isOwnMessage ? "#fff" : "#000";

  return (
    <div className={`flex gap-3 ${isOwnMessage ? "flex-row-reverse" : ""}`}>
      {/* Message Content */}
      <div
        className={`flex flex-col ${
          isOwnMessage ? "items-end" : "items-start"
        }`}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            minWidth: "11rem",
            maxWidth: { xs: "18rem", lg: "28rem" },
            borderRadius: "8px",
            borderTopRightRadius: isOwnMessage ? 0 : "8px",
            borderTopLeftRadius: !isOwnMessage ? 0 : "8px",
            bgcolor: bgColor,
            color: textColor,
            opacity: message.isTemp ? 0.5 : 1,
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
            lineHeight: 1.5,
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: isOwnMessage ? "100%" : "-13px",
              width: 0,
              height: 0,
              borderTop: `13px solid ${bgColor}`,
              borderTopRightRadius: isOwnMessage ? 6 : "none",
              borderTopLeftRadius: !isOwnMessage ? 6 : "none",
              borderRight: isOwnMessage ? "13px solid transparent" : "none",
              borderLeft: !isOwnMessage ? "13px solid transparent" : "none",
            }}
          />
          <Typography dir="auto">{message.text}</Typography>

          <Box className="flex items-center justify-end gap-2 mt-3">
            <Typography
              sx={{
                color: isOwnMessage
                  ? theme.currentPalette.background
                  : alpha(theme.currentPalette.text, 0.5),
                fontSize: "10px",
              }}
            >
              {formatTime(message.createdAt)}
            </Typography>

            {isOwnMessage && (
              <div className="mt-1 flex items-center gap-1">
                {message.seen ? (
                  <>
                    <span
                      style={{
                        color: isOwnMessage
                          ? theme.currentPalette.background
                          : theme.currentPalette.primary,
                      }}
                    >
                      <CheckCheck size={15} />
                    </span>
                  </>
                ) : (
                  <span className="text-gray-400">
                    <Check size={15} />
                  </span>
                )}
              </div>
            )}
          </Box>
        </Box>
      </div>
    </div>
  );
};
