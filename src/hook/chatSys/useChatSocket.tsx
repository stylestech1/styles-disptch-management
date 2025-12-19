"use client";
import { useEffect, useRef } from "react";
import { RootState, useAppDispatch, useAppSelector } from "@/redux/store";
import {
  addLiveMessage,
  setTyping,
  setUserOnline,
  setUserOffline,
  setUserPresence,
  markMessageSeen,
  upsertConversation,
} from "@/redux/slices/chatSlice";
import { socketService } from "@/services/socketService";
import { SOCKET_EVENTS } from "@/constants/ChatSocketEvent";
import { Message } from "@/types/chatType";
import { useGetUserConversationsQuery } from "@/redux/slices/apiSlice";

export const useChatSocket = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state: RootState) => state.auth);
  const selectedConversationId = useAppSelector(
    (state) => state.chat.selectedConversationId
  );
  const selectedConversationIdRef = useRef<string | null>(selectedConversationId);
  const typingTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});
  const listenersAttached = useRef(false);

  const { data: conversations } = useGetUserConversationsQuery();

  // keep selectedConversationId updated
  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  // setup socket & listeners
  useEffect(() => {
    if (!auth?.token || !auth?.user?.id) return;

    socketService.setAuth(auth);
    socketService.connect();

    if (listenersAttached.current) return;
    listenersAttached.current = true;

    // join all conversation rooms
    conversations?.forEach((conv) => socketService.joinConversation(conv.id));

    // -------------------- Messages --------------------
    const handleNewMessage = (msg: Message) => {
      dispatch(addLiveMessage(msg));
      dispatch(
        upsertConversation({ id: msg.conversationId, lastMessage: msg })
      );
    };
    socketService.on<Message>(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);

    // -------------------- Seen Status --------------------
    const handleSeenUpdate = ({ conversationId, currentUserId }: { conversationId: string; currentUserId?: string }) => {
      dispatch(markMessageSeen({ conversationId, currentUserId }));
    };
    socketService.on(SOCKET_EVENTS.SEEN_UPDATE, handleSeenUpdate);

    const handleSeenAck = ({ conversationId, currentUserId }: { conversationId: string; currentUserId?: string }) => {
      dispatch(markMessageSeen({ conversationId, currentUserId }));
    };
    socketService.on(SOCKET_EVENTS.SEEN_ACKNOWLEDGED, handleSeenAck);

    // -------------------- Typing --------------------
    const handleTyping = ({ userId, conversationId }: { userId: string; conversationId: string }) => {
      dispatch(setTyping({ conversationId, isTyping: true }));

      if (typingTimeoutsRef.current[userId]) clearTimeout(typingTimeoutsRef.current[userId]);

      typingTimeoutsRef.current[userId] = setTimeout(() => {
        dispatch(setTyping({ conversationId, isTyping: false }));
        delete typingTimeoutsRef.current[userId];
      }, 3000);
    };
    socketService.on(SOCKET_EVENTS.TYPING, handleTyping);

    const handleStopTyping = ({ userId, conversationId }: { userId: string; conversationId: string }) => {
      if (typingTimeoutsRef.current[userId]) {
        clearTimeout(typingTimeoutsRef.current[userId]);
        delete typingTimeoutsRef.current[userId];
      }
      dispatch(setTyping({ conversationId, isTyping: false }));
    };
    socketService.on(SOCKET_EVENTS.STOP_TYPING, handleStopTyping);

    // -------------------- Presence --------------------
    const handleUserOnline = ({ userId }: { userId: string }) => dispatch(setUserOnline({ userId }));
    socketService.on(SOCKET_EVENTS.USER_ONLINE, handleUserOnline);

    const handleUserOffline = ({ userId, lastSeen }: { userId: string; lastSeen?: string }) =>
      dispatch(setUserOffline({ userId, lastSeen }));
    socketService.on(SOCKET_EVENTS.USER_OFFLINE, handleUserOffline);

    const handlePresenceList = (list: { userId: string; isOnline: boolean; lastSeen?: string }[]) => {
      const presenceMap = list.reduce((acc, u) => {
        acc[u.userId] = { isOnline: u.isOnline, lastSeen: u.lastSeen };
        return acc;
      }, {} as Record<string, { isOnline: boolean; lastSeen?: string }>);
      dispatch(setUserPresence(presenceMap));
    };
    socketService.on(SOCKET_EVENTS.PRESENCE_LIST, handlePresenceList);

    // -------------------- Cleanup --------------------
    return () => {
      console.log("🧹 Cleaning up chat socket listeners...");
      listenersAttached.current = false;

      socketService.off(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
      socketService.off(SOCKET_EVENTS.SEEN_UPDATE, handleSeenUpdate);
      socketService.off(SOCKET_EVENTS.SEEN_ACKNOWLEDGED, handleSeenAck);
      socketService.off(SOCKET_EVENTS.TYPING, handleTyping);
      socketService.off(SOCKET_EVENTS.STOP_TYPING, handleStopTyping);
      socketService.off(SOCKET_EVENTS.USER_ONLINE, handleUserOnline);
      socketService.off(SOCKET_EVENTS.USER_OFFLINE, handleUserOffline);
      socketService.off(SOCKET_EVENTS.PRESENCE_LIST, handlePresenceList);

      Object.values(typingTimeoutsRef.current).forEach(clearTimeout);
      typingTimeoutsRef.current = {};
    };
  }, [auth, conversations, dispatch]);

  // -------------------- Emit Helpers --------------------
  return {
    joinConversation: (conversationId: string) => socketService.joinConversation(conversationId),
    leaveConversation: (conversationId: string) => socketService.leaveConversation(conversationId),
    sendMessage: (conversationId: string, text: string) => socketService.sendMessage(conversationId, text),
    markSeen: (conversationId: string) => socketService.markSeen(conversationId),
    startTyping: (conversationId: string) => socketService.startTyping(conversationId),
    stopTyping: (conversationId: string) => socketService.stopTyping(conversationId),
    getPresenceList: () => socketService.getPresenceList(),
    ping: () => socketService.emit(SOCKET_EVENTS.PING, {}),
  };
};
