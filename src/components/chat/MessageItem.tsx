"use client";
import { Message } from "@/types/chatType";
import { RootState, useAppSelector } from "@/redux/store";
import { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";

interface MessageItemProps {
  message: Message;
  conversationId?: string;
}

export const MessageItem = ({ message }: MessageItemProps) => {
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const theme = useAppSelector((state: RootState) => state.palette);
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
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-gray-500">
            {formatTime(message.createdAt)}
          </span>
        </div>

        <Box
          sx={{
            px: 2,
            py: 1.5,
            maxWidth: { xs: "18rem", lg: "28rem" },
            borderRadius: "16px",
            borderBottomRightRadius: isOwnMessage ? 0 : "16px",
            borderTopLeftRadius: !isOwnMessage ? 0 : "16px",
            bgcolor: bgColor,
            color: textColor,
            opacity: message.isTemp ? 0.5 : 1,
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
            lineHeight: 1.5,
          }}
        >
          <Typography dir="auto">{message.text}</Typography>
        </Box>

        {/* Seen Status */}
        {isOwnMessage && (
          <div className="mt-1 flex items-center gap-1">
            {message.seen ? (
              <>
                <span className="text-x" style={{color: theme.currentPalette.primary}}>✓✓</span>
              </>
            ) : (
              <span className="text-xs text-gray-400">✓</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
