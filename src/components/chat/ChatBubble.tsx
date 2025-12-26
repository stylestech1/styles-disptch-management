"use client";
import React from "react";
import { MessageCircleMore } from "lucide-react";
import { RootState, useAppSelector } from "@/redux/store";
import { usePathname } from "next/navigation";
import Link from "next/link";

const ChatBubble = () => {
  const userRole = useAppSelector((state: RootState) => state.auth.user?.role);
  const theme = useAppSelector((state: RootState) => state.palette);
  const pathname = usePathname();

  if (
    pathname.includes("/chat") ||
    pathname === "/" ||
    pathname.startsWith("/login")
  ) {
    return null;
  }

  return (
    <Link
      href={
        userRole === "employee" ? "/dispatchers/chat" : `/${userRole}/chat`
      }
      className="fixed bottom-6 right-6 p-4 z-50 flex items-center justify-center rounded-full"
      style={{
        color: theme.currentPalette.background,
        backgroundColor: theme.currentPalette.primary,
      }}
    >
      <MessageCircleMore size={25} />
    </Link>
  );
};

export default ChatBubble;
