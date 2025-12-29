"use client";
import { useEffect, useMemo, useRef } from "react";
import { RootState, useAppDispatch, useAppSelector } from "@/redux/store";
import { MessageItem } from "./MessageItem";
import { useGetConversationMessagesQuery } from "@/redux/slices/apiSlice";
import { upsertConversation } from "@/redux/slices/chatSlice";
import { alpha } from "@mui/material";
import { Box } from "@mui/system";
import Dots from "./ui/dots";

interface MessageListProps {
  conversationId: string;
}

export const MessageList = ({ conversationId }: MessageListProps) => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state: RootState) => state.palette);

  const { data: messages = [], isSuccess } =
    useGetConversationMessagesQuery(conversationId);

  const liveMessages = useAppSelector(
    (state: RootState) => state.chat.liveMessages[conversationId] || []
  );

  const typingState = useAppSelector((state: RootState) => state.chat.typing);

  const endRef = useRef<HTMLDivElement>(null);

  /* ---------------------- hydrate old messages once ---------------------- */
  const typingUsers = typingState[conversationId] || [];
  const isTyping = typingUsers.length > 0;

  useEffect(() => {
    dispatch(
      upsertConversation({
        id: conversationId,
        messages: [],
      })
    );
  }, [conversationId, dispatch]);

  useEffect(() => {
    if (isSuccess && messages.length) {
      dispatch(
        upsertConversation({
          id: conversationId,
          messages,
        })
      );
    }
  }, [isSuccess, messages, conversationId, dispatch]);

  /* ----------------------- auto scroll on new messages ----------------------- */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [liveMessages.length, isTyping]);

  /* ----------------------- play sound on new message ----------------------- */
  const prevMessagesCountRef = useRef(liveMessages.length);

  useEffect(() => {
    if (liveMessages.length > prevMessagesCountRef.current) {
      const audio = new Audio("/audio/message.mp3");
      audio.play().catch((err) => {
        console.log("Audio play failed:", err);
      });
    }
    prevMessagesCountRef.current = liveMessages.length;
  }, [liveMessages]);

  return (
    <div className="relative h-full">
      <Box
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url(/images/chatScreen.png)",
          backgroundRepeat: "repeat",
          backgroundSize: "auto",
          backgroundPosition: "0 0",
          backgroundAttachment: "fixed",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            bgcolor: alpha(theme.currentPalette.secondary, 0.1),
          }}
        />
      </Box>

      <div className="relative z-10 h-full p-4 space-y-4 overflow-y-auto">
        {liveMessages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}

        {isTyping && (
          <Dots/>
        )}

        <div ref={endRef} />
      </div>
    </div>
  );
};
