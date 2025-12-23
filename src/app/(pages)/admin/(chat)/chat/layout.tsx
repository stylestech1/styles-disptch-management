import { ReactNode } from "react";
import {ChatSidebar} from "@/components/chat/ChatSidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-full md:w-1/4 border-r border-gray-200">
        <ChatSidebar />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 hidden md:flex flex-col">
        <ChatWindow />
      </div>

      <div className="md:hidden flex-1">{children}</div>
    </div>
  );
}
