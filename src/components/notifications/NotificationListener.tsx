"use client";
import { useEffect, useRef } from "react";
import { socketService } from "@/services/socketService";
import { RootState, useAppDispatch, useAppSelector } from "@/redux/store";
import { addNotification } from "@/redux/slices/notificationSlice";

export default function NotificationListener() {
  const auth = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const hasConnected = useRef(false);

  useEffect(() => {
    if (auth?.token && !hasConnected.current && auth?.user?.id ) {
      socketService.setAuth(auth);
      socketService.connect();
      hasConnected.current = true;
      
      socketService.on("newNotification", async (data) => {
        await dispatch(addNotification(data));
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