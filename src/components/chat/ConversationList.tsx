'use client'
import { Conversation } from '@/types/chatType';
import { useAppSelector } from '@/redux/store';
import { ConversationItem } from './ConversationItem';

interface ConversationListProps {
  conversations: Conversation[];
}

export const ConversationList = ({ conversations }: ConversationListProps) => {
  const selectedConversationId = useAppSelector(
    state => state.chat.selectedConversationId
  );
  
  return (
    <div className="divide-y divide-gray-100">
      {conversations.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No Conversation Found 😢
        </div>
      ) : (
        conversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isSelected={conversation.id === selectedConversationId}
          />
        ))
      )}
    </div>
  );
};