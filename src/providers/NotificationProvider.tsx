"use client";
import HeaderNotifications from "@/components/notifications/HeaderNotifications";
import NotificationListener from "@/components/notifications/NotificationListener";
import { usePathname } from "next/navigation";
import { Box } from "@mui/material";

const NotificationProvider = () => {
  const pathname = usePathname();

  const showNotifications =
    pathname.startsWith("/dispatchers") || pathname.startsWith("/admin");

  return (
    <>
      {showNotifications && (
        <>
          <Box>
            <HeaderNotifications />
          </Box>
          <NotificationListener />
        </>
      )}
    </>
  );
};

export default NotificationProvider;
