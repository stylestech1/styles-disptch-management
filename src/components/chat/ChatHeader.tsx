"use client";
import { Conversation } from "@/types/chatType";
import { useAppSelector } from "@/redux/store";
import { Avatar } from "./ui/Avatar";

interface ChatHeaderProps {
  conversation: Conversation;
}

export const ChatHeader = ({ conversation }: ChatHeaderProps) => {
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const otherMember = conversation.members.find(
    (member) => member.id !== currentUserId
  );

  const isOnline = useAppSelector((state) =>
    otherMember ? state.chat.presence[otherMember.id]?.isOnline : false
  );

  // Typing indicator
  const isTyping = useAppSelector(
    (state) => state.chat.typing[conversation.id]
  );

  return (
    <div className="border-b border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar
            name={otherMember?.name || "user"}
            size="lg"
            status={isOnline ? "online" : "offline"}
          />

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-900">
                {otherMember?.name || "unkown user"}
              </h2>
              {/* {otherMember && (
                <Badge variant="secondary">
                  {getUserRole(otherMember.id)}
                </Badge>
              )} */}
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-sm ${
                  isOnline ? "text-green-600" : "text-gray-500"
                }`}
              >
                {isOnline ? "online" : "offline"}
              </span>

              {isTyping && (
                <span className="text-sm text-blue-600 animate-pulse">...</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
