"use client";
import { useEffect, useRef, useState } from "react";
import { RootState, useAppDispatch, useAppSelector } from "@/redux/store";
import {
  addLiveMessage,
  addTypingUser,
  setUserOnline,
  setUserOffline,
  setUserPresence,
  markMessageSeen,
  upsertConversation,
  removeTypingUser,
} from "@/redux/slices/chatSlice";
import { socketService } from "@/services/socketService";
import { SOCKET_EVENTS } from "@/constants/ChatSocketEvent";
import { Message } from "@/types/chatType";

export const useChatSocket = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const selectedConversationId = useAppSelector(
    (state: RootState) => state.chat.selectedConversationId
  );

  /* -------------------------------------------------------------------------- */
  /*                                   REFS                                     */
  /* -------------------------------------------------------------------------- */
  const selectedConversationIdRef = useRef<string | null>(null);
  const listenersAttached = useRef(false);

  const [isSocketReady, setIsSocketReady] = useState(false);

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  /* -------------------------------------------------------------------------- */
  /*                         WAIT FOR SOCKET READY                               */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!auth?.token || !auth?.user?.id) return;

    const checkReady = () => {
      if (socketService.getConnectionStatus()) {
        setIsSocketReady(true);
      }
    };

    checkReady();

    socketService.onConnect(() => {
      console.log("🔌 Socket connected");
      setIsSocketReady(true);
    });

    socketService.onDisconnect(() => {
      console.log("🔌 Socket disconnected");
      setIsSocketReady(false);
      listenersAttached.current = false;
    });
  }, [auth]);

  /* -------------------------------------------------------------------------- */
  /*                           SOCKET LISTENERS                                  */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!isSocketReady || !auth?.user?.id) return;
    if (listenersAttached.current) return;

    listenersAttached.current = true;
    console.log("🎧 Attaching chat socket listeners");

    /* ----------------------------- NEW MESSAGE ----------------------------- */
    const handleNewMessage = (msg: Message) => {
      dispatch(addLiveMessage(msg));
      dispatch(
        upsertConversation({
          id: msg.conversationId,
          lastMessage: msg,
        })
      );
    };

    /* ------------------------------- SEEN ---------------------------------- */
    const handleSeen = ({
      conversationId,
      currentUserId,
    }: {
      conversationId: string;
      currentUserId: string;
    }) => {
      console.log("👁️ Messages seen in conversation:", conversationId);
      dispatch(
        markMessageSeen({
          conversationId,
          currentUserId,
        })
      );
    };

    const handleSeenAck = ({
      conversationId,
      currentUserId,
    }: {
      conversationId: string;
      currentUserId: string;
    }) => {

      console.log("✅ Seen acknowledged by user:", currentUserId);
      dispatch(
        markMessageSeen({
          conversationId,
          currentUserId,
        })
      );
    };

    /* ------------------------------ TYPING --------------------------------- */
    const handleTyping = ({
      conversationId,
      userId,
    }: {
      conversationId: string;
      userId: string;
    }) => {
      if (userId === auth.user?.id) return;

      dispatch(
        addTypingUser({
          conversationId,
          userId,
        })
      );
    };

    const handleStopTyping = ({
      conversationId,
      userId,
    }: {
      conversationId: string;
      userId: string;
    }) => {
      if (userId === auth.user?.id) return;

      dispatch(
        removeTypingUser({
          conversationId,
          userId,
        })
      );
    };

    /* ----------------------------- PRESENCE -------------------------------- */
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

    /* ----------------------------- REGISTER -------------------------------- */
    socketService.on(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
    socketService.on(SOCKET_EVENTS.SEEN_UPDATE, handleSeen);
    socketService.on(SOCKET_EVENTS.SEEN_ACKNOWLEDGED, handleSeenAck);
    socketService.on(SOCKET_EVENTS.TYPING, handleTyping);
    socketService.on(SOCKET_EVENTS.STOP_TYPING, handleStopTyping);
    socketService.on(SOCKET_EVENTS.USER_ONLINE, handleUserOnline);
    socketService.on(SOCKET_EVENTS.USER_OFFLINE, handleUserOffline);
    socketService.on(SOCKET_EVENTS.PRESENCE_LIST, handlePresenceList);

    socketService.getPresenceList();

    /* ------------------------------ CLEANUP -------------------------------- */
    return () => {
      listenersAttached.current = false;

      socketService.off(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
      socketService.off(SOCKET_EVENTS.SEEN_UPDATE, handleSeen);
      socketService.off(SOCKET_EVENTS.SEEN_ACKNOWLEDGED, handleSeenAck);
      socketService.off(SOCKET_EVENTS.TYPING, handleTyping);
      socketService.off(SOCKET_EVENTS.STOP_TYPING, handleStopTyping);
      socketService.off(SOCKET_EVENTS.USER_ONLINE, handleUserOnline);
      socketService.off(SOCKET_EVENTS.USER_OFFLINE, handleUserOffline);
      socketService.off(SOCKET_EVENTS.PRESENCE_LIST, handlePresenceList);
    };
  }, [isSocketReady, auth?.user?.id, dispatch]);

  /* -------------------------------------------------------------------------- */
  /*                               EMIT HELPERS                                 */
  /* -------------------------------------------------------------------------- */
  return {
    sendMessage: (conversationId: string, text: string) =>
      socketService.sendMessage(conversationId, text),

    startTyping: (conversationId: string) =>{
      console.log("🎯 [useChatSocket] startTyping called for:", conversationId);
      socketService.startTyping(conversationId)},

    stopTyping: (conversationId: string) =>{
      console.log("🎯 [useChatSocket] stopTyping called for:", conversationId);
      socketService.stopTyping(conversationId)},

    markSeen: (conversationId: string) =>
      socketService.markSeen(conversationId),

    isSocketReady,
  };
};
