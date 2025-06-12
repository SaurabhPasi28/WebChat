// src/components/Chat/ChatArea.jsx
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import UserProfile from './UserProfile';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

export default function ChatArea({ onBack }) {
  return (
    <div className="flex flex-col h-full p-0">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-10 bg-white border-b p-1 md:p-3 flex items-center">
        <button 
          onClick={onBack}
          className="mr-2 p-1 rounded-full hover:bg-gray-100"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
        </button>
        <UserProfile />
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <UserProfile />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
        <MessageList />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-white border-t">
        <ChatInput />
      </div>
    </div>
  );
}