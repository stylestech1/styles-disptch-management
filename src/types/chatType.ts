import { TNotification } from "./notificationType";

export type TMessage = {
  id: string;
  from: string;
  to: string;
  text: string;
  createdAt: string;
};

export type TChatState = {
  messages: Record<string, TMessage[]>;
  onlineUsers: string[];
  selectedUser: string | null;
};

export interface ClientToServerEvents {
  send_message: (msg: TMessage) => void;
  mark_notification_as_read: (id: string) => void;
  join_user_room: (userId: string) => void;
}

export interface ServerToClientEvents {
  message_received: (msg: TMessage) => void;
  notification_received: (notification: TNotification) => void;
  join_user_room: (userId: string) => void;
  online_users: (users: string[]) => void;
  receive_message: (msg: TMessage) => void;
}
