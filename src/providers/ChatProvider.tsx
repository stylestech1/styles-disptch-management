"use client";
import { ReactNode, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { socketService } from "@/services/socketService";
import { SOCKET_EVENTS } from "@/constants/ChatSocketEvent";
import {
  addLiveMessage,
  setTyping,
  setUserOnline,
  setUserOffline,
  setUserPresence,
  upsertConversation,
} from "@/redux/slices/chatSlice";
import { useGetUserConversationsQuery } from "@/redux/slices/apiSlice";
import { Message, Presence, PresenceItem } from "@/types/chatType";

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
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

    // join each conversation room
    conversations?.forEach((conv) => {
      socketService.joinConversation(conv.id);
    });

    // ------------------------------------------------------------------------
    // Socket listeners
    // ------------------------------------------------------------------------
    const handleNewMessage = (msg: Message) => dispatch(addLiveMessage(msg));
    const handleTyping = (data: {
      conversationId: string;
      isTyping: boolean;
    }) => dispatch(setTyping(data));
    const handleUserOnline = (data: { userId: string }) =>
      dispatch(setUserOnline(data));
    const handleUserOffline = (data: { userId: string; lastSeen?: string }) =>
      dispatch(setUserOffline(data));
    const handlePresenceList = (list: PresenceItem[]) => {
      const presence: Presence = {};
      list.forEach((p) => {
        presence[p.userId] = { isOnline: p.isOnline, lastSeen: p.lastSeen };
      });
      dispatch(setUserPresence(presence));
    };

    socketService.on(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
    socketService.on(SOCKET_EVENTS.TYPING, handleTyping);
    socketService.on(SOCKET_EVENTS.STOP_TYPING, handleTyping);
    socketService.on(SOCKET_EVENTS.USER_ONLINE, handleUserOnline);
    socketService.on(SOCKET_EVENTS.USER_OFFLINE, handleUserOffline);
    socketService.on(SOCKET_EVENTS.PRESENCE_LIST, handlePresenceList);

    return () => {
      socketService.off(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
      socketService.off(SOCKET_EVENTS.TYPING, handleTyping);
      socketService.off(SOCKET_EVENTS.STOP_TYPING, handleTyping);
      socketService.off(SOCKET_EVENTS.USER_ONLINE, handleUserOnline);
      socketService.off(SOCKET_EVENTS.USER_OFFLINE, handleUserOffline);
      socketService.off(SOCKET_EVENTS.PRESENCE_LIST, handlePresenceList);
    };
  }, [auth, conversations, dispatch]);

  return <>{children}</>;
};
