export type TNotification = {
  title: string;
  id: string;
  message: string;
  module: "system" | "loads" | "trucks" | "drivers" | "identity";
  importance: "low" | "medium" | "high";
  from: string;
  toRole: string;
  toUser: {
    id: string;
    name: string;
  };
  status: "unread" | "read";
  createdAt: string;
  updatedAt: string;
};