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

  useEffect(() => {
    if (auth?.token && !hasConnected.current && auth?.user?.id) {
      socketService.setAuth(auth);
      socketService.connect();
      hasConnected.current = true;

      socketService.on("newNotification", async (data) => {
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
    };
  }, [auth, dispatch]);

  return null;
}
