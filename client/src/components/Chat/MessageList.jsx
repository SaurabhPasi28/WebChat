import { useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import Message from './Message';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';

export default function MessageList() {
  const { messages, selectedUser, loading, deleteMessage } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Helper function to get formatted date label
  const getDateLabel = (date) => {
    const messageDate = new Date(date);
    
    if (isToday(messageDate)) {
      return 'Today';
    } else if (isYesterday(messageDate)) {
      return 'Yesterday';
    } else {
      return format(messageDate, 'MMMM dd, yyyy');
    }
  };

  // Helper function to check if we should show date separator
  const shouldShowDateSeparator = (currentMessage, previousMessage) => {
    if (!previousMessage) return true; // Always show for first message
    
    const currentDate = new Date(currentMessage.createdAt);
    const previousDate = new Date(previousMessage.createdAt);
    
    return !isSameDay(currentDate, previousDate);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          <span className="text-gray-600 dark:text-dark-textSecondary">Loading messages...</span>
        </div>
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="flex items-center justify-center h-full">
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

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-full flex items-center justify-center mb-6 shadow-soft dark:shadow-soft-dark">
          <svg className="h-10 w-10 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-text mb-2">
          Start a conversation with {selectedUser.username}
        </h3>
        <p className="text-gray-600 dark:text-dark-textSecondary mb-4">
          Send your first message to begin chatting
        </p>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <div className={`w-2 h-2 rounded-full ${selectedUser.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>{selectedUser.isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Welcome Message */}
        <div className="text-center py-4">
          <div className="inline-flex items-center space-x-2 bg-gray-100 dark:bg-dark-surface rounded-full px-4 py-2 shadow-soft dark:shadow-soft-dark">
            <div className={`w-2 h-2 rounded-full ${selectedUser.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600 dark:text-dark-textSecondary">
              {selectedUser.username} is {selectedUser.isOnline ? 'online' : 'offline'}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4">
          {messages.map((message, index) => {
            const isOwnMessage = message.sender._id === user?.userId;
            const isLastMessage = index === messages.length - 1;
            const nextMessage = messages[index + 1];
            const previousMessage = messages[index - 1];
            const showDateSeparator = shouldShowDateSeparator(message, previousMessage);
            const showAvatar = !isOwnMessage && (
              !nextMessage || 
              nextMessage.sender._id !== message.sender._id ||
              new Date(message.createdAt) - new Date(nextMessage.createdAt) > 5 * 60 * 1000 // 5 minutes
            );
            
            return (
              <div key={message._id}>
                {/* Date Separator */}
                {showDateSeparator && (
                  <div className="flex items-center justify-center my-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-200 dark:border-dark-border"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="px-4 py-1 bg-gray-100 dark:bg-dark-surface text-xs font-medium text-gray-600 dark:text-dark-textSecondary rounded-full shadow-sm border border-gray-200 dark:border-dark-border">
                          {getDateLabel(message.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Message */}
                <Message 
                  message={message} 
                  isOwnMessage={isOwnMessage}
                  showAvatar={showAvatar}
                  isLastMessage={isLastMessage}
                  onDeleteMessage={deleteMessage}
                />
              </div>
            );
          })}
        </div>

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}