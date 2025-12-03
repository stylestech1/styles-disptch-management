import { io, Socket } from "socket.io-client";
import { TAuthState } from "@/types/globalTypes";
import { ClientToServerEvents, ServerToClientEvents } from "@/types/chatType";
import { TNotification } from "@/types/notificationType";

class NotificationSocketService {
  private socket: Socket<
    Pick<ServerToClientEvents, "notification_received">,
    Pick<ClientToServerEvents, "mark_notification_as_read">
  > | null = null;

  private auth: TAuthState | null = null;
  private isConnected = false;

  setAuth(auth: TAuthState) {
    this.auth = auth;
  }

  connect() {
    if (!this.auth?.token || this.isConnected) return;

    this.socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      transports: ["websocket"],
      auth: { token: this.auth.token },
    });

    this.socket.on("connect", () => (this.isConnected = true));
    this.socket.on("disconnect", () => (this.isConnected = false));
    this.socket.on("connect_error", (err) => {
      console.error("Notification socket connection error:", err);
      this.isConnected = false;
    });
  }

  onNotificationReceived(listener: (notification: TNotification) => void) {
    this.socket?.on("notification_received", listener);
  }

  markNotificationAsRead(id: string) {
    this.socket?.emit("mark_notification_as_read", id);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.isConnected = false;
  }

  getConnectionStatus(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }
}

export const notificationSocketService = new NotificationSocketService();
