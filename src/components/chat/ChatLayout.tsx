"use client";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { RootState, useAppSelector } from "@/redux/store";

export default function ChatLayout( ) {
  const selectedConversationId = useAppSelector(
    (state: RootState) => state.chat.selectedConversationId
  );

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <div
        className={`
          w-full lg:w-1/4 border-r border-gray-200
          ${selectedConversationId ? "hidden lg:block" : "block"}
        `}
      >
        <ChatSidebar />
      </div>

      {/* Chat Window */}
      <div
        className={`
          flex-1 flex flex-col
          ${selectedConversationId ? "block" : "hidden lg:flex"}
        `}
      >
        <ChatWindow />
      </div>
    </div>
  );
}
