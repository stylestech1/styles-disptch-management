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

  const selectedConversationIdRef = useRef<string | null>(null);
  const listenersAttached = useRef(false);
  const typingTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});

  const { data: conversations } = useGetUserConversationsQuery();

  /* -------------------------------------------------------------------------- */
  /*                         keep selectedConversationId                        */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  /* -------------------------------------------------------------------------- */
  /*                       connect socket + listeners                            */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!auth?.token || !auth?.user?.id) return;

    // Get PresenceList when login (socket connected)
    socketService.onConnect(() => {
      socketService.getPresenceList();
    });

    if (listenersAttached.current) return;
    listenersAttached.current = true;

    /* --------------------------- NEW MESSAGE -------------------------------- */
    const handleNewMessage = (msg: Message) => {
      dispatch(addLiveMessage(msg));
      dispatch(
        upsertConversation({
          id: msg.conversationId,
          lastMessage: msg,
        })
      );
    };

    socketService.on(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);

    /* ----------------------------- SEEN ------------------------------------- */
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

    socketService.on(SOCKET_EVENTS.SEEN_UPDATE, handleSeen);
    socketService.on(SOCKET_EVENTS.SEEN_ACKNOWLEDGED, handleSeen);

    /* ---------------------------- TYPING ------------------------------------ */
    const handleTyping = ({ userId }: { userId: string }) => {
      if (userId === auth?.user?.id) return;

      const conversationId = selectedConversationIdRef.current;
      if (!conversationId) return;

      dispatch(setTyping({ conversationId, isTyping: true }));

      clearTimeout(typingTimeoutsRef.current[userId]);

      typingTimeoutsRef.current[userId] = setTimeout(() => {
        dispatch(setTyping({ conversationId, isTyping: false }));
      }, 3000);
    };

    const handleStopTyping = ({ userId }: { userId: string }) => {
      if (userId === auth?.user?.id) return;

      const conversationId = selectedConversationIdRef.current;
      if (!conversationId) return;

      if (typingTimeoutsRef.current[userId]) {
        clearTimeout(typingTimeoutsRef.current[userId]);
        delete typingTimeoutsRef.current[userId];
      }

      dispatch(setTyping({ conversationId, isTyping: false }));
    };

    socketService.on(SOCKET_EVENTS.TYPING, handleTyping);
    socketService.on(SOCKET_EVENTS.STOP_TYPING, handleStopTyping);

    /* --------------------------- PRESENCE ----------------------------------- */
    socketService.on(
      SOCKET_EVENTS.USER_ONLINE,
      ({ userId }: { userId: string }) => dispatch(setUserOnline({ userId }))
    );

    socketService.on(
      SOCKET_EVENTS.USER_OFFLINE,
      ({ userId, lastSeen }: { userId: string; lastSeen?: string }) =>
        dispatch(setUserOffline({ userId, lastSeen }))
    );

    socketService.on(
      SOCKET_EVENTS.PRESENCE_LIST,
      (
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
      }
    );

    /* ---------------------------- CLEANUP ----------------------------------- */
    return () => {
      listenersAttached.current = false;

      socketService.off(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
      socketService.off(SOCKET_EVENTS.SEEN_UPDATE, handleSeen);
      socketService.off(SOCKET_EVENTS.SEEN_ACKNOWLEDGED, handleSeen);
      socketService.off(SOCKET_EVENTS.TYPING, handleTyping);
      socketService.off(SOCKET_EVENTS.STOP_TYPING, handleStopTyping);

      Object.values(typingTimeoutsRef.current).forEach(clearTimeout);
      typingTimeoutsRef.current = {};
    };
  }, [auth, dispatch]);

  /* -------------------------------------------------------------------------- */
  /*                      join / leave conversation rooms                       */
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

    startTyping: (conversationId: string) =>
      socketService.startTyping(conversationId),

    stopTyping: (conversationId: string) =>
      socketService.stopTyping(conversationId),

    markSeen: (conversationId: string) =>
      socketService.markSeen(conversationId),

    joinConversation: (conversationId: string) =>
      socketService.joinConversation(conversationId),

    leaveConversation: (conversationId: string) =>
      socketService.leaveConversation(conversationId),

    getPresenceList: () => socketService.getPresenceList(),
  };
};
