import { io, Socket } from "socket.io-client";
import { TAuthState } from "@/types/globalTypes";
import { TMessage, ClientToServerEvents, ServerToClientEvents } from "@/types/chatType";

class ChatSocketService {
  private socket: Socket<
    Pick<ServerToClientEvents, "message_received" | "online_users">,
    Pick<ClientToServerEvents, "send_message" | "join_user_room">
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

    this.socket.on("connect", () => {
      this.isConnected = true;
      if (this.auth?.user?.id) {
        this.joinUserRoom(this.auth.user.id);
      }
    });

    this.socket.on("disconnect", () => (this.isConnected = false));
    this.socket.on("connect_error", (err) => {
      console.error("Chat socket connection error:", err);
      this.isConnected = false;
    });
  }

  joinUserRoom(userId: string) {
    this.socket?.emit("join_user_room", userId);
  }

  onMessageReceived(listener: (msg: TMessage) => void) {
    this.socket?.on("message_received", listener);
  }

  onOnlineUsers(listener: (users: string[]) => void) {
    this.socket?.on("online_users", listener);
  }

  sendMessage(msg: TMessage) {
    this.socket?.emit("send_message", msg);
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

export const chatSocketService = new ChatSocketService();
