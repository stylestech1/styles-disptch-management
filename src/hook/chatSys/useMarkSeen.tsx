import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector, RootState } from "@/redux/store";
import { markMessageSeen } from "@/redux/slices/chatSlice";
import { socketService } from "@/services/socketService";

export const useMarkMessagesSeen = (conversationId: string | null) => {
  const dispatch = useAppDispatch();

  const messages = useAppSelector(
    (state: RootState) =>
      state.chat.liveMessages[conversationId || ""] || []
  );

  const currentUserId = useAppSelector(
    (state: RootState) => state.auth.user?.id
  );

  /**
   * Mark messages as seen (Redux + Socket)
   */
  const markAsSeen = useCallback(() => {
    if (!conversationId || !currentUserId) return;

    const hasUnseenMessages = messages.some(
      (msg) => !msg.seen && msg.sender?.id !== currentUserId
    );

    if (!hasUnseenMessages) return;

    // Update UI immediately
    dispatch(
      markMessageSeen({
        conversationId,
        currentUserId,
      })
    );

    // Notify backend
    socketService.markSeen(conversationId);
  }, [conversationId, currentUserId, messages, dispatch]);

  /**
   * ✅ When browser tab becomes active again
   */
  useEffect(() => {
    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        markAsSeen();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [markAsSeen]);

  return { markAsSeen };
};
