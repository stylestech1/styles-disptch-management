"use client";
import { useEffect, useMemo, useRef } from "react";
import { RootState, useAppDispatch, useAppSelector } from "@/redux/store";
import { MessageItem } from "./MessageItem";
import { useGetConversationMessagesQuery } from "@/redux/slices/apiSlice";
import { upsertConversation } from "@/redux/slices/chatSlice";

interface MessageListProps {
  conversationId: string;
}

export const MessageList = ({ conversationId }: MessageListProps) => {
  const dispatch = useAppDispatch();

  const { data: messages = [], isSuccess } =
    useGetConversationMessagesQuery(conversationId);

  const liveMessages = useAppSelector(
    (state: RootState) => state.chat.liveMessages[conversationId] || []
  );

  const typingState = useAppSelector((state: RootState) => state.chat.typing);

  const endRef = useRef<HTMLDivElement>(null);

  /* ---------------------- hydrate old messages once ---------------------- */
  const isTyping = useMemo(() => {
    if (!conversationId) return false;
    return typingState[conversationId] || false;
  }, [typingState, conversationId]);

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
  }, [liveMessages.length]);

  return (
    <div className="h-full p-4 space-y-4 overflow-y-auto">
      {liveMessages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}

      {/* Typing Indicator */}
      {isTyping && (
        <div className="flex items-center gap-2 p-3">
          <div className="bg-gray-100 rounded-2xl rounded-tl-none p-4">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></div>
            </div>
          </div>
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
};
