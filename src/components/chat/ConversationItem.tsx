"use client";
import { Conversation } from "@/types/chatType";
import { RootState, useAppDispatch, useAppSelector } from "@/redux/store";
import { setSelectedConversation } from "@/redux/slices/chatSlice";
import { Avatar } from "./ui/Avatar";
import { Badge } from "./ui/Badge";

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
}

export const ConversationItem = ({
  conversation,
  isSelected,
}: ConversationItemProps) => {
  const dispatch = useAppDispatch();

  const unreadCount = useAppSelector(
    (state: RootState) => state.chat.unreadCounts[conversation.id] || 0
  );

  const currentUserId = useAppSelector(
    (state: RootState) => state.auth.user?.id
  );

  const presenceList = useAppSelector(
    (state: RootState) => state.chat.presence
  );

  const otherMember = conversation.members.find(
    (member) => member.id !== currentUserId
  );

  const userPresence = otherMember ? presenceList[otherMember.id] : undefined;

  const isUserOnline = userPresence?.isOnline ?? false;
  const lastSeen = userPresence?.lastSeen;

  const handleClick = () => {
    dispatch(setSelectedConversation(conversation.id));
  };

  const formatLastSeen = (dateString?: string) => {
    if (!dateString) return "Offline";
    const date = new Date(dateString);
    return `Last seen ${date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })}`;
  };

  const getLastMessageText = () => {
    if (!conversation.lastMessage) return (<span className="text-xs text-gray-300">Chat me...</span>);
    return conversation.lastMessage.text;
  };

  return (
    <div
      onClick={handleClick}
      className={`
        flex items-center p-4 cursor-pointer transition-colors
        ${
          isSelected
            ? "bg-blue-50 border-r-4 border-blue-500"
            : "hover:bg-gray-50"
        }
      `}
    >
      {/* Avatar */}
      <div className="relative">
        <Avatar
          name={otherMember?.name || "User"}
          size="md"
          status={isUserOnline ? "online" : "offline"}
        />
      </div>

      {/* Conversation Info */}
      <div className="flex-1 ml-3 min-w-0">
        <div className="flex justify-between items-center">
          <div className="flex justify-between items-center w-full">
            <h3 className="font-semibold text-gray-900 truncate">
              {otherMember?.name || "Unknown user"}
            </h3>

            {/* Online / Last seen */}
            <span className="text-xs text-gray-500">
              {isUserOnline ? "Online" : formatLastSeen(lastSeen)}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-gray-600 truncate">
            {getLastMessageText()}
          </p>

          {unreadCount > 0 && (
            <Badge variant="primary" size="sm">
              {unreadCount}
            </Badge>
          )}
        </div>

        {/* Typing Indicator */}
        <div className="mt-1">
          <TypingIndicator conversationId={conversation.id} />
        </div>
      </div>
    </div>
  );
};

// Typing Indicator Component
const TypingIndicator = ({ conversationId }: { conversationId: string }) => {
  const isTyping = useAppSelector((state) => state.chat.typing[conversationId]);

  if (!isTyping) return null;

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300"></div>
      </div>
    </div>
  );
};
