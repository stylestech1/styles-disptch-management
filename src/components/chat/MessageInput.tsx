"use client";
import { useState, useEffect, useRef } from "react";
import { useAddMessageMutation } from "@/redux/slices/apiSlice";
import { socketService } from "@/services/socketService";
import { SOCKET_EVENTS } from "@/constants/ChatSocketEvent";
import { Send } from "lucide-react";

interface MessageInputProps {
  conversationId: string;
}

export const MessageInput = ({ conversationId }: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const socket = socketService.getSocket();

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

    console.log("🚀 Emitting TYPING event for conversation:", conversationId);

    socketService.emit(SOCKET_EVENTS.TYPING, { conversationId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      console.log("⏰ 2 seconds passed, emitting STOP_TYPING");
      stopTyping();
    }, 2000);
  };

  // Stop typing
  const stopTyping = () => {
    if (!conversationId || !socket?.connected) return;

    console.log(
      "🛑 Emitting STOP_TYPING event for conversation:",
      conversationId
    );

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
      console.log("📝 User is typing, calling startTyping()");
      startTyping();
    } else {
      console.log("📭 Input is empty, calling stopTyping()");
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
          rows={1}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none max-h-32"
          disabled={isLoading}
        />
      </div>

      {/* Send Button */}
      <div className="flex items-center">
        <button
          onClick={handleSend}
          disabled={!message.trim() || isLoading}
          className={`
            px-4 py-3 rounded-lg font-medium transition-colors
            ${
              message.trim() && !isLoading
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Sending...</span>
            </div>
          ) : (
            <Send className="w-6 h-6" />
          )}
        </button>
      </div>
    </div>
  );
};
