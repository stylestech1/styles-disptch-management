"use client";
import { RootState, useAppDispatch, useAppSelector } from "@/redux/store";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { useChatSocket } from "@/hook/chatSys/useChatSocket";
import { useEffect } from "react";
import { Box } from "@mui/material";
import { MessageCircleMore } from "lucide-react";
import { setSelectedConversation } from "@/redux/slices/chatSlice";

export const ChatWindow = () => {
  const theme = useAppSelector((state: RootState) => state.palette);
  const dispatch = useAppDispatch();

  const selectedConversationId = useAppSelector(
    (state: RootState) => state.chat.selectedConversationId
  );

  const conversation = useAppSelector((state) =>
    selectedConversationId
      ? state.chat.conversations[selectedConversationId]
      : null
  );

  const isOnline = useAppSelector((state) => state.chat.onlineUsers);

  const { markSeen } = useChatSocket();

  // Close Chat When pressing ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedConversationId) {
        dispatch(setSelectedConversation(null));
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dispatch, selectedConversationId]);

  /* ----------------------- mark seen ----------------------- */
  useEffect(() => {
    if (!selectedConversationId) return;

    const handleVisibility = () => {
      if (document.visibilityState === "visible" && isOnline) {
        markSeen(selectedConversationId);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    if (document.visibilityState === "visible" && isOnline) {
      const timer = setTimeout(() => {
        markSeen(selectedConversationId);
      }, 500);

      return () => clearTimeout(timer);
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [selectedConversationId, markSeen, isOnline]);

  if (!selectedConversationId || !conversation) {
    return (
      <Box
        className="flex-1 flex items-center justify-center"
        sx={{ bgcolor: theme.currentPalette.background }}
      >
        <div className="text-center">
          <MessageCircleMore
            size={60}
            className="mx-auto mb-3"
            color={theme.currentPalette.primary}
          />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select Conversation
          </h3>
          <p className="text-gray-500">
            Select a conversation from list to start chatting
          </p>
        </div>
      </Box>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <ChatHeader conversation={conversation} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <MessageList conversationId={selectedConversationId} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <MessageInput conversationId={selectedConversationId} />
      </div>
    </div>
  );
};
