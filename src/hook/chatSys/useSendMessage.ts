"use client";
import { useCallback } from "react";
import { chatSocketService } from "@/services/ChatSocketService";
import { TMessage } from "@/types/chatType";

export const useSendMessage = () => {
  const sendMessage = useCallback((message: TMessage) => {
    if (!chatSocketService.getConnectionStatus()) {
      console.warn("Socket is not connected!");
      return;
    }

    chatSocketService.sendMessage(message);
  }, []);

  return { sendMessage };
};
