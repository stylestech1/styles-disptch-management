"use client";
import { useEffect, useRef, useState } from "react";
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

export const useChatSocket = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const selectedConversationId = useAppSelector(
    (state: RootState) => state.chat.selectedConversationId
  );

  const [isSocketReady, setIsSocketReady] = useState(false);
  const listenersAttached = useRef(false);
  const typingTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});
  const selectedConversationIdRef = useRef<string | null>(null);

  // Update selectedConversationId every change
  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  /* -------------------------------------------------------------------------- */
  /*                    WAIT FOR SOCKET TO BE READY                             */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!auth?.token || !auth?.user?.id) return;

    // Check if socket is ready
    const checkSocket = () => {
      const isReady = socketService.getConnectionStatus();
      if (isReady && !isSocketReady) {
        console.log("✅ Socket is ready for listeners");
        setIsSocketReady(true);
      }
    };

    // Check immediately
    checkSocket();

    // Also listen for connect event
    socketService.onConnect(() => {
      console.log("🔌 Socket connected event fired");
      setIsSocketReady(true);
    });

    socketService.onDisconnect(() => {
      console.log("🔌 Socket disconnected");
      setIsSocketReady(false);
      listenersAttached.current = false;
    });

    // Poll every 100ms until socket is ready (max 10 seconds)
    const interval = setInterval(checkSocket, 100);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!isSocketReady) {
        console.error("❌ Socket failed to initialize after 10 seconds");
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [auth, isSocketReady]);

  /* -------------------------------------------------------------------------- */
  /*                       ATTACH LISTENERS WHEN READY                          */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!isSocketReady || !auth?.token || !auth?.user?.id) return;

    if (listenersAttached.current) {
      console.log("⚠️ Listeners already attached, skipping...");
      return;
    }

    console.log("🎧 Attaching socket listeners NOW...");
    listenersAttached.current = true;

    /* --------------------------- NEW MESSAGE ------------------------------ */
    const handleNewMessage = (msg: Message) => {
      console.log("📨 New message received:", msg);
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
      console.log("👁️ Message seen:", conversationId);
      dispatch(markMessageSeen({ conversationId, currentUserId }));
      socketService.acknowledgeSeen(conversationId);
    };

    /* ---------------------------- TYPING ------------------------------------ */
    const handleTyping = ({ userId }: { userId: string }) => {
      if (userId === auth.user?.id) return;

      const convId = selectedConversationIdRef.current;
      if (!convId) return;

      console.log("⌨️ User typing:", userId);
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

      console.log("🛑 User stopped typing:", userId);
      dispatch(
        setTyping({
          conversationId: convId,
          isTyping: false,
        })
      );
    };

    /* --------------------------- PRESENCE -------------------------------- */
    const handleUserOnline = ({ userId }: { userId: string }) => {
      console.log("🟢 User online:", userId);
      dispatch(setUserOnline({ userId }));
    };

    const handleUserOffline = ({
      userId,
      lastSeen,
    }: {
      userId: string;
      lastSeen?: string;
    }) => {
      console.log("🔴 User offline:", userId);
      dispatch(setUserOffline({ userId, lastSeen }));
    };

    const handlePresenceList = (
      list: {
        userId: string;
        isOnline: boolean;
        lastSeen?: string;
      }[]
    ) => {
      console.log("👥 Presence list received:", list.length, "users");
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

    console.log("✅ All socket listeners attached successfully");

    // Request presence list
    console.log("🔄 Requesting presence list...");
    socketService.getPresenceList();

    /* --------------------------- CLEANUP --------------------------------- */
    return () => {
      console.log("🧹 Cleaning up socket listeners...");
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
  }, [isSocketReady, auth, dispatch]);

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
    isSocketReady: () => isSocketReady,
  };
};