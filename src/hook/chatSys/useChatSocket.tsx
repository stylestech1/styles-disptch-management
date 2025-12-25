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
  const auth = useAppSelector((state) => state.auth);
  const selectedConversationId = useAppSelector(
    (state: RootState) => state.chat.selectedConversationId
  );

  const listenersAttached = useRef(false);
  const typingTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});
  const selectedConversationIdRef = useRef<string | null>(null);

  // Update selectedConversationId every change
  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  const { data: conversations } = useGetUserConversationsQuery();

  /* -------------------------------------------------------------------------- */
  /*                       SOCKET LISTENERS (AFTER CONNECT)                     */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!auth?.token || !auth?.user?.id) return;

    const attachListeners = () => {
      if (listenersAttached.current) return;
      listenersAttached.current = true;

      /* --------------------------- NEW MESSAGE ------------------------------ */
      const handleNewMessage = (msg: Message) => {
        dispatch(addLiveMessage(msg));
        dispatch(
          upsertConversation({
            id: msg.conversationId,
            lastMessage: msg,
          })
        );
      };

      /* ----------------------------- SEEN ---------------------------------- */
      const handleSeen = ({
        conversationId,
        currentUserId,
      }: {
        conversationId: string;
        currentUserId?: string;
      }) => {
        dispatch(markMessageSeen({ conversationId, currentUserId }));
        socketService.acknowledgeSeen(conversationId);
      };

      /* ---------------------------- TYPING ------------------------------------ */
      const handleTyping = ({ userId }: { userId: string }) => {
        if (userId === auth.user?.id) return;

        const convId = selectedConversationIdRef.current;
        if (!convId) return;

        dispatch(
          setTyping({
            conversationId: convId,
            isTyping: true,
          })
        );
      };

      const handleStopTyping = ({ userId }: { userId: string }) => {
        if (userId === auth.user?.id) return;

        const convId = selectedConversationIdRef.current;
        if (!convId) return;

        dispatch(
          setTyping({
            conversationId: convId,
            isTyping: false,
          })
        );
      };

      /* --------------------------- PRESENCE -------------------------------- */
      const handleUserOnline = ({ userId }: { userId: string }) => {
        dispatch(setUserOnline({ userId }));
      };

      const handleUserOffline = ({
        userId,
        lastSeen,
      }: {
        userId: string;
        lastSeen?: string;
      }) => {
        dispatch(setUserOffline({ userId, lastSeen }));
      };

      const handlePresenceList = (
        list: {
          userId: string;
          isOnline: boolean;
          lastSeen?: string;
        }[]
      ) => {
        const map = list.reduce((acc, u) => {
          acc[u.userId] = {
            isOnline: u.isOnline,
            lastSeen: u.lastSeen,
          };
          return acc;
        }, {} as Record<string, { isOnline: boolean; lastSeen?: string }>);

        dispatch(setUserPresence(map));
      };

      /* --------------------------- REGISTER -------------------------------- */
      socketService.on(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
      socketService.on(SOCKET_EVENTS.SEEN_UPDATE, handleSeen);
      socketService.on(SOCKET_EVENTS.SEEN_ACKNOWLEDGED, handleSeen);
      socketService.on(SOCKET_EVENTS.TYPING, handleTyping);
      socketService.on(SOCKET_EVENTS.STOP_TYPING, handleStopTyping);
      socketService.on(SOCKET_EVENTS.USER_ONLINE, handleUserOnline);
      socketService.on(SOCKET_EVENTS.USER_OFFLINE, handleUserOffline);
      socketService.on(SOCKET_EVENTS.PRESENCE_LIST, handlePresenceList);

      /* --------------------------- CLEANUP --------------------------------- */
      return () => {
        listenersAttached.current = false;

        socketService.off(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
        socketService.off(SOCKET_EVENTS.SEEN_UPDATE, handleSeen);
        socketService.off(SOCKET_EVENTS.SEEN_ACKNOWLEDGED, handleSeen);
        socketService.off(SOCKET_EVENTS.TYPING, handleTyping);
        socketService.off(SOCKET_EVENTS.STOP_TYPING, handleStopTyping);
        socketService.off(SOCKET_EVENTS.USER_ONLINE, handleUserOnline);
        socketService.off(SOCKET_EVENTS.USER_OFFLINE, handleUserOffline);
        socketService.off(SOCKET_EVENTS.PRESENCE_LIST, handlePresenceList);

        Object.values(typingTimeoutsRef.current).forEach(clearTimeout);
        typingTimeoutsRef.current = {};
      };
    };

    // ✅ attach after connect
    if (socketService.getConnectionStatus()) {
      attachListeners();
    } else {
      socketService.onConnect(attachListeners);
    }
  }, [auth, dispatch]);

  /* -------------------------------------------------------------------------- */
  /*                      JOIN / LEAVE CONVERSATION ROOMS                       */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!conversations?.length) return;

    conversations.forEach((conv) => {
      socketService.joinConversation(conv.id);
    });

    return () => {
      conversations.forEach((conv) => {
        socketService.leaveConversation(conv.id);
      });
    };
  }, [conversations]);

  /* -------------------------------------------------------------------------- */
  /*                               EMIT HELPERS                                */
  /* -------------------------------------------------------------------------- */
  return {
    sendMessage: (conversationId: string, text: string) =>
      socketService.sendMessage(conversationId, text),

    startTyping: (conversationId: string) => {
      socketService.startTyping(conversationId);
    },

    stopTyping: (conversationId: string) => {
      socketService.stopTyping(conversationId);
    },

    markSeen: (conversationId: string) =>
      socketService.markSeen(conversationId),

    // Helper Debugging
    getCurrentConversationId: () => selectedConversationIdRef.current,
    getTypingState: () => typingTimeoutsRef.current,
  };
};
