"use client";
import { ReactNode, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { socketService } from "@/services/socketService";
import { upsertConversation } from "@/redux/slices/chatSlice";
import { useGetUserConversationsQuery } from "@/redux/slices/apiSlice";
import { useChatSocket } from "@/hook/chatSys/useChatSocket";

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  useChatSocket();

  const dispatch = useAppDispatch();
  const { data: conversations = [] } = useGetUserConversationsQuery();
  const auth = useAppSelector((state) => state.auth);

  // --------------------------------------------------------------------------
  // Get ConverstationLists
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (conversations.length > 0) {
      conversations.forEach((conv) => {
        dispatch(upsertConversation(conv));
      });
    }
  }, [conversations, dispatch]);

  // --------------------------------------------------------------------------
  // Connect socket when auth is ready
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!auth?.token || !auth?.user?.id) return;

    socketService.setAuth(auth);
    socketService.connect();
  }, [auth]);

  return <>{children}</>;
};
