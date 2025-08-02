import { useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import UserProfile from './UserProfile';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';

export default function ChatArea({ onBack }) {
  const { selectedUser, messages, typingUsers, loading } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-dark-bg">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-dark-surface rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text">Select a conversation</h3>
          <p className="text-gray-500 dark:text-dark-textSecondary">Choose from your contacts to start chatting</p>
        </div>
      </div>
    );
  }

  const isTyping = typingUsers.has(selectedUser._id);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark-bg">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center p-3">
          <button 
            onClick={onBack}
            className="mr-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <UserProfile />
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block">
          <UserProfile />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden relative">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              <span className="text-gray-600 dark:text-dark-textSecondary">Loading messages...</span>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto bg-gradient-to-b from-gray-50 to-white dark:from-dark-bg dark:to-dark-surface">
            <MessageList />
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="px-4 py-2 animate-fade-in">
                <TypingIndicator user={selectedUser} />
              </div>
            )}
            
            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border">
        <ChatInput />
      </div>
    </div>
  );
}