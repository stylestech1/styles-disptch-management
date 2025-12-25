"use client";
import { Conversation } from "@/types/chatType";
import { RootState, useAppDispatch, useAppSelector } from "@/redux/store";
import { setSelectedConversation } from "@/redux/slices/chatSlice";
import { Avatar } from "./ui/Avatar";
import { Badge } from "./ui/Badge";
import { alpha, Box } from "@mui/material";

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
}

export const ConversationItem = ({
  conversation,
  isSelected,
}: ConversationItemProps) => {
  const dispatch = useAppDispatch();

  const theme = useAppSelector((state: RootState) => state.palette);

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
    if (!conversation.lastMessage)
      return <span className="text-xs text-gray-300">Chat me...</span>;
    return conversation.lastMessage.text;
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        display: "flex",
        alignItems: "center",
        p: 2,
        cursor: "pointer",
        transition: "background-color 0.2s ease",

        backgroundColor: isSelected
          ? alpha(theme.currentPalette.primary, 0.08)
          : unreadCount > 0
          ? alpha(theme.currentPalette.primary, 0.1)
          : "transparent",

        borderRight: isSelected
          ? `4px solid ${theme.currentPalette.primary}`
          : "4px solid transparent",

        "&:hover": {
          backgroundColor: isSelected
            ? alpha(theme.currentPalette.primary, 0.12)
            : unreadCount > 0
            ? alpha(theme.currentPalette.primary, 0.14)
            : alpha(theme.currentPalette.secondary, 0.06),
        },
      }}
    >
      {/* Avatar */}
      <div className="relative">
        <Avatar
          name={otherMember?.name || "User"}
          size="md"
          status={isUserOnline ? "online" : "offline"}
          style={{
            bgcolor: theme.currentPalette.secondary,
            color: theme.currentPalette.background,
          }}
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
            <Badge variant="danger" size="sm">
              {unreadCount}
            </Badge>
          )}
        </div>

        {/* Typing Indicator */}
        <div className="mt-1">
          <TypingIndicator conversationId={conversation.id} />
        </div>
      </div>
    </Box>
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
