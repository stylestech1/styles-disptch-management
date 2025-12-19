"use client";
import { addMessage, setOnlineUsers } from "@/redux/slices/chatSlice";
import { RootState, useAppDispatch, useAppSelector } from "@/redux/store";
import { chatSocketService } from "@/services/ChatSocketService";
import { useEffect } from "react";

const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.auth.user);
  const token = useAppSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    if (!user || !token) return;

    // connect socket
    chatSocketService.setAuth({ user, token: token });
    chatSocketService.connect();

    // online users handler
    chatSocketService.onOnlineUsers((users) => {
      dispatch(setOnlineUsers(users));
    });

    // private messages handler
    chatSocketService.onMessageReceived((msg) => {
      dispatch(addMessage(msg));
    });

    return () => chatSocketService.disconnect();
  }, [user, token, dispatch]);

  return <>{children}</>;
};

export default ChatProvider;
