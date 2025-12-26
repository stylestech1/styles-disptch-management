'use client';
import ChatLayout from './layout';

export default function ChatPage() {
  
  
  return (
    <ChatLayout>
      <div className="h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">
            Start Conversation
          </p>
        </div>
      </div>
    </ChatLayout>
  );
}