import { SOCKET_EVENTS } from "@/constants/ChatSocketEvent";
import { TAuthState } from "@/types/globalTypes";
import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;
  private auth: TAuthState | null = null;
  private isConnected = false;

  setAuth(auth: TAuthState) {
    this.auth = auth;
  }

  /* -------------------------------------------------------------------------- */
  /*                               INITIALIZATION                               */
  /* -------------------------------------------------------------------------- */

  connect() {
    if (!this.auth?.token) {
      console.warn("Cannot connect: No auth token available");
      return;
    }

    if (this.isConnected) {
      console.log("Socket already connected");
      return;
    }

    /* -------------------------------------------------------------------------- */
    /*                               CORE LISTENERS                                */
    /* -------------------------------------------------------------------------- */

    try {
      this.socket = io(process.env.NEXT_PUBLIC_API_URL!, {
        transports: ["websocket"],
        autoConnect: true,
        auth: {
          token: this.auth.token,
        },
      });

      this.socket.on("connect", () => {
        this.isConnected = true;
        if (this.auth?.user?.id) {
          this.joinUserRoom(this.auth.user.id);
        }
      });

      this.socket.on("disconnect", (reason) => {
        console.log("Disconnected from socket:", reason);
        this.isConnected = false;
      });

      this.socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        this.isConnected = false;
      });
    } catch (error) {
      console.error("Failed to connect socket:", error);
    }
  }

  onConnect(cb: () => void) {
    if (!this.socket) return;
    this.socket.off("connect", cb);
    this.socket.on("connect", cb);
  }

  onDisconnect(cb: () => void) {
    if (!this.socket) return;
    this.socket?.off("disconnect", cb);
    this.socket?.on("disconnect", cb);
  }

  /* -------------------------------------------------------------------------- */
  /*                             Notification HELPERS                           */
  /* -------------------------------------------------------------------------- */

  joinUserRoom(userId: string) {
    if (!this.socket) {
      console.warn("Socket not initialized");
      return;
    }

    this.socket.emit("join-user-room", userId);
    console.log(`🚀 Joined user room: user_${userId}`);
  }

  /* -------------------------------------------------------------------------- */
  /*                             CHAT HELPERS                                   */
  /* -------------------------------------------------------------------------- */

  joinConversation(conversationId: string) {
    this.emit(SOCKET_EVENTS.JOIN_CONVERSATION, { conversationId });
  }

  leaveConversation(conversationId: string) {
    this.emit(SOCKET_EVENTS.LEAVE_CONVERSATION, { conversationId });
  }

  sendMessage(conversationId: string, text: string) {
    this.emit(SOCKET_EVENTS.SEND_MESSAGE, { conversationId, text });
  }

  markSeen(conversationId: string) {
    this.emit(SOCKET_EVENTS.MARK_SEEN, { conversationId });
  }

  acknowledgeSeen(conversationId: string) {
    this.emit(SOCKET_EVENTS.SEEN_ACKNOWLEDGED, { conversationId });
  }

  startTyping(conversationId: string) {
    this.emit(SOCKET_EVENTS.TYPING, { conversationId });
  }

  stopTyping(conversationId: string) {
    this.emit(SOCKET_EVENTS.STOP_TYPING, { conversationId });
  }

  getPresenceList() {
    this.emit(SOCKET_EVENTS.PRESENCE_LIST, {});
  }

  /* -------------------------------------------------------------------------- */
  /*                                EVENT SYSTEM                                */
  /* -------------------------------------------------------------------------- */

  on<T>(event: string, callback: (data: T) => void) {
    if (!this.socket) {
      console.warn("Socket not initialized");
      return;
    }
    this.socket.off(event, callback);
    this.socket.on(event, callback);
  }

  off<T>(event: string, callback?: (data: T) => void) {
    if (!this.socket) {
      console.warn("Socket not initialized");
      return;
    }

    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                                   EMIT                                     */
  /* -------------------------------------------------------------------------- */

  emit<T>(event: string, data: T) {
    if (!this.socket) {
      console.warn("Socket not initialized");
      return;
    }
    this.socket?.emit(event, data);
  }

  /* -------------------------------------------------------------------------- */
  /*                                 CLEANUP                                    */
  /* -------------------------------------------------------------------------- */

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                                  GETTERS                                   */
  /* -------------------------------------------------------------------------- */

  getConnectionStatus(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();
