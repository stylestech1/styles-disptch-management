"use client";
import { useEffect, useRef } from "react";
import { socketService } from "@/services/socketService";
import { RootState, useAppDispatch, useAppSelector } from "@/redux/store";
import { addNotification } from "@/redux/slices/notificationSlice";
import toast from "react-hot-toast";

export default function NotificationListener() {
  const auth = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const hasConnected = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/audio/notify.mp3");
    audioRef.current.volume = 0.7;
  }, []);

  useEffect(() => {
    if (auth?.token && !hasConnected.current && auth?.user?.id) {
      socketService.setAuth(auth);
      socketService.connect();
      hasConnected.current = true;

      socketService.on("newNotification", async (data) => {
        if (audioRef.current) {
          try {
            audioRef.current.currentTime = 0;
            await audioRef.current.play();
          } catch (error) {
            console.error("Failed to play notification sound:", error);
          }
        }

        await dispatch(addNotification(data));
        toast.success(
          `🔔 ${data.message
            .replace(/\([^)]*\)/g, "")
            .replace(/\s+/g, " ")
            .trim()}`,
          { duration: 4000 }
        );
      });
    }

    return () => {
      if (hasConnected.current) {
        socketService.disconnect();
        hasConnected.current = false;
      }
      
      // تنظيف عنصر الصوت
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [auth, dispatch]);

  return null;
}