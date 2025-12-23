'use client'
import { Message } from '@/types/chatType';
import { useAppSelector } from '@/redux/store';
import { Avatar } from './ui/Avatar';
import { useEffect, useRef } from 'react';

interface MessageItemProps {
  message: Message;
  conversationId?: string
}

export const MessageItem = ({ message }: MessageItemProps) => {
  const currentUserId = useAppSelector(state => state.auth.user?.id);
  const isOwnMessage = message.sender.id === currentUserId;
  const isSeen = message.seen;
  const hasBeenSeenRef = useRef(false);

   useEffect(() => {
    if (!isOwnMessage && !isSeen && !hasBeenSeenRef.current) {
      hasBeenSeenRef.current = true;
    }
  }, [isOwnMessage, isSeen]);
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  
  return (
    <div className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
      {/* Avatar for received messages */}
      {!isOwnMessage && (
        <div className="flex-shrink-0">
          <Avatar 
            name={message.sender.name || 'User'}
            size="sm"
          />
        </div>
      )}
      
      {/* Message Content */}
      <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2 mb-1">
          {!isOwnMessage && (
            <span className="text-sm font-medium text-gray-700">
              {message.sender.name}
            </span>
          )}
          <span className="text-xs text-gray-500">
            {formatTime(message.createdAt)}
          </span>
        </div>
        
        <div
          className={`
            px-4 py-2 rounded-2xl max-w-xs lg:max-w-md
            ${isOwnMessage
              ? 'bg-blue-500 text-white rounded-br-none'
              : 'bg-gray-100 text-gray-900 rounded-tl-none'
            }
            ${message.isTemp ? 'opacity-50' : ''}
          `}
        >
          <p className="break-words leading-relaxed whitespace-pre-wrap" dir="auto">{message.text}</p>
        </div>
        
        {/* Seen Status */}
        {isOwnMessage && (
          <div className="mt-1 flex items-center gap-1">
            {message.seen ? (
              <>
                <span className="text-xs text-blue-500">✓✓</span>
              </>
            ) : (
              <span className="text-xs text-gray-400">✓</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};