"use client";
import { useEffect, useRef } from "react";
import { notificationSocketService } from "@/services/NotificationSocketService";
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
      notificationSocketService.setAuth(auth);
      notificationSocketService.connect();
      hasConnected.current = true;

      notificationSocketService.onNotificationReceived( async (data) => {
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
          `${data.message
            .replace(/\([^)]*\)/g, "")
            .replace(/\s+/g, " ")
            .trim()}`,
          { duration: 4000 }
        );
      });
    }

    return () => {
      if (hasConnected.current) {
        notificationSocketService.disconnect();
        hasConnected.current = false;
      }
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [auth, dispatch]);

  return null;
}