import { useState, useEffect, useRef } from "react";
import { useAddMessageMutation } from "@/redux/slices/apiSlice";
import { socketService } from "@/services/socketService";
import { SOCKET_EVENTS } from "@/constants/ChatSocketEvent";
import { SendHorizontal } from "lucide-react";
import { RootState, useAppSelector } from "@/redux/store";
import { alpha, Button } from "@mui/material";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

interface MessageInputProps {
  conversationId: string;
}

export const MessageInput = ({ conversationId }: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
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

  // Handle outside click to close emoji picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        showEmojiPicker &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(target) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

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
    if (!socketService.getConnectionStatus()) return;
    if (!conversationId || !socket?.connected) return;

    socketService.emit(SOCKET_EVENTS.TYPING, { conversationId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

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

    if (newValue.trim()) startTyping();
    else stopTyping();
  };

  useEffect(() => {
    return () => {
      stopTyping();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const onEmojiClick = (emojiObject: EmojiClickData) => {
    setMessage((prev) => prev + emojiObject.emoji);
  };

  const isDisabled = !message.trim() || isLoading;

  return (
    <div className="flex items-start gap-2 w-full relative">
      {/* Text Area + Emoji */}
      <div className="flex-1 relative">
        {/* Emoji Toggle Button */}
        <button
          ref={emojiButtonRef}
          type="button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="absolute left-2 top-6 -translate-y-1/2 rounded-full p-2 cursor-pointer"
          style={{ background: alpha(theme.currentPalette.primary, 0.1) }}
        >
          😊
        </button>

        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Message me..."
          rows={1}
          className="w-full pl-15 pr-4 py-3 rounded-lg outline-none resize-none max-h-32 overflow-hidden"
          style={{
            backgroundColor: alpha(theme.currentPalette.secondary, 0.1),
            border: isFocused
              ? `1px solid ${theme.currentPalette.secondary}`
              : "none",
            transition: "border 0.2s ease",
          }}
          disabled={isLoading}
        />

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div ref={emojiPickerRef} className="absolute bottom-12 left-0 z-50">
            <EmojiPicker onEmojiClick={onEmojiClick} />
          </div>
        )}
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
          <SendHorizontal className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};
