"use client";
import { useState } from "react";
import { SearchBar } from "./SearchBar";
import { ConversationList } from "./ConversationList";
import { UserStatus } from "./UserStatus";
import { useConversations } from "@/hook/chatSys/useConversations";
import { Tab } from "@/types/chatType";
import { UsersList } from "./UsersList";

export const ChatSidebar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("conversations");

  const { conversations, isLoading, isError } = useConversations();

  const filteredConversations = conversations.filter((conv) => {
    const memberNames = conv.members.map((m) => m.name || "").join(" ");
    return memberNames.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="p-4 border-b border-gray-200">
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <div className="text-red-500 text-center">
          <svg
            className="w-12 h-12 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p>Failed to Load Conversation</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* User Status */}
      <div className="p-4 border-b border-gray-200">
        <UserStatus />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("conversations")}
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === "conversations"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500"
          }`}
        >
          Chats
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === "users"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500"
          }`}
        >
          Users
        </button>
      </div>

      {/* Search Bar */}
      {activeTab === "conversations" && (
        <div className="p-4 border-b border-gray-200">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "conversations" ? (
          <ConversationList conversations={filteredConversations} />
        ) : (
          <UsersList />
        )}
      </div>
    </div>
  );
};
