"use client";
import { useEffect, useRef } from "react";
import { socketService } from "@/services/socketService";
import { RootState, useAppDispatch, useAppSelector } from "@/redux/store";
import { addNotification } from "@/redux/slices/notificationSlice";
import toast from "react-hot-toast";
import { TNotification } from "@/types/notificationType";

export default function NotificationListener() {
  const auth = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();

  const hasConnected = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notificationHandlerRef = useRef<
    ((data: TNotification) => Promise<void>) | null
  >(null);

  useEffect(() => {
    audioRef.current = new Audio("/audio/notify.mp3");
    audioRef.current.volume = 1;
  }, []);

  useEffect(() => {
    if (!auth?.token || !auth?.user?.id) return;

    if (!hasConnected.current) {
      socketService.setAuth(auth);
      socketService.connect();
      hasConnected.current = true;
    }

    notificationHandlerRef.current = async (data: TNotification) => {
      if (audioRef.current) {
        try {
          audioRef.current.currentTime = 0;
          await audioRef.current.play();
        } catch (error) {
          console.error("Failed to play notification sound:", error);
        }
      }

      dispatch(addNotification(data));
      toast.success(
        `🔔 ${data.message
          .replace(/\([^)]*\)/g, "")
          .replace(/\s+/g, " ")
          .trim()}`,
        { duration: 4000 }
      );
    };

    socketService.on<TNotification>(
      "newNotification",
      notificationHandlerRef.current
    );

    return () => {
      if (notificationHandlerRef.current) {
        socketService.off<TNotification>(
          "newNotification",
          notificationHandlerRef.current
        );
      }
    };
  }, [auth, dispatch]);

  return null;
}
