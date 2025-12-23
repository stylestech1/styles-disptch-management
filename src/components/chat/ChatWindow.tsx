"use client";
import { RootState, useAppSelector } from "@/redux/store";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { useChatSocket } from "@/hook/chatSys/useChatSocket";
import { useEffect } from "react";

export const ChatWindow = () => {
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
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select Conversation
          </h3>
          <p className="text-gray-500">
            Select a conversation from list to start chatting
          </p>
        </div>
      </div>
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
