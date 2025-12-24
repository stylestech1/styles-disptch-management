"use client";
import { useState, useEffect, useRef } from "react";
import { useAddMessageMutation } from "@/redux/slices/apiSlice";
import { socketService } from "@/services/socketService";
import { SOCKET_EVENTS } from "@/constants/ChatSocketEvent";
import { SendHorizontal } from "lucide-react";
import { RootState, useAppSelector } from "@/redux/store";
import { alpha, Button } from "@mui/material";

interface MessageInputProps {
  conversationId: string;
}

export const MessageInput = ({ conversationId }: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const socket = socketService.getSocket();
  const theme = useAppSelector((state: RootState) => state.palette);
  const [isFocused, setIsFocused] = useState(false);

  const [addMessage, { isLoading }] = useAddMessageMutation();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [message]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    try {
      if (socket?.connected) {
        socketService.emit(SOCKET_EVENTS.SEND_MESSAGE, {
          conversationId,
          text: message.trim(),
        });
      } else {
        await addMessage({
          conversationId,
          text: message.trim(),
        }).unwrap();
      }

      setMessage("");
      stopTyping();
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    } catch (error) {
      console.error("❌ Failed to send message:", error);
    }
  };

  const startTyping = () => {
    if (!socketService.getConnectionStatus()) {
      console.error("❌ Socket not connected, cannot emit typing");
      return;
    }

    if (!conversationId || !socket?.connected) return;

    socketService.emit(SOCKET_EVENTS.TYPING, { conversationId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  // Stop typing
  const stopTyping = () => {
    if (!conversationId || !socket?.connected) return;

    socketService.emit(SOCKET_EVENTS.STOP_TYPING, { conversationId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter") return;

    if (e.shiftKey) {
      e.preventDefault();

      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      const newValue = message.slice(0, start) + "\n" + message.slice(end);

      setMessage(newValue);

      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 1;
      });

      return;
    }

    e.preventDefault();
    handleSend();
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);

    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${Math.min(
          textareaRef.current.scrollHeight,
          120
        )}px`;
      }
    });

    if (newValue.trim()) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  useEffect(() => {
    return () => {
      stopTyping();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const isDisabled = !message.trim() || isLoading;

  return (
    <div className="flex items-start gap-2">
      {/* Text Area */}
      <div className="flex-1">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Message me..."
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          rows={1}
          className="w-full px-4 py-3 rounded-lg outline-none resize-none max-h-32 overflow-hidden"
          style={{
            backgroundColor: alpha(theme.currentPalette.secondary, 0.1),
            border: isFocused
              ? `1px solid ${theme.currentPalette.secondary}`
              : "none",
            transition: "border 0.2s ease",
          }}
          disabled={isLoading}
        />
      </div>

      {/* Send Button */}
      <div className="flex items-center">
        <Button
          onClick={handleSend}
          disabled={isDisabled}
          sx={{
            px: 2,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 500,
            transition: "background-color 0.3s",
            bgcolor: isDisabled
              ? alpha(theme.currentPalette.text, 0.2)
              : theme.currentPalette.primary,
            color: isDisabled ? alpha(theme.currentPalette.text, 0.7) : "#fff",
            cursor: isDisabled ? "not-allowed" : "pointer",
            "&:hover": {
              bgcolor: isDisabled
                ? alpha(theme.currentPalette.text, 0.2)
                : theme.currentPalette.primary,
            },
          }}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Sending...</span>
            </div>
          ) : (
            <SendHorizontal className="w-6 h-6" />
          )}
        </Button>
      </div>
    </div>
  );
};
