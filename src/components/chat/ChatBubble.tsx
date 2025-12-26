"use client";
import React from "react";
import { MessageCircleMore } from "lucide-react";
import { RootState, useAppSelector } from "@/redux/store";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Badge } from "./ui/Badge";
import { Box } from "@mui/material";

const ChatBubble = () => {
  const userRole = useAppSelector((state: RootState) => state.auth.user?.role);
  const theme = useAppSelector((state: RootState) => state.palette);
  const pathname = usePathname();

  const unreadCounts = useAppSelector(
    (state: RootState) => state.chat.unreadCounts
  );

  const totalUnreadCount = Object.values(unreadCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  if (
    pathname.includes("/chat") ||
    pathname === "/" ||
    pathname.startsWith("/login")
  ) {
    return null;
  }

  return (
    <Box position="relative">
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
        {totalUnreadCount > 0 && (
          <Badge
            variant="danger"
            size="sm"
            className="absolute -top-1 -right-1"
          >
            {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
          </Badge>
        )}
        <MessageCircleMore size={25} />
      </Link>
    </Box>
  );
};

export default ChatBubble;
