import { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { 
  PaperAirplaneIcon, 
  PaperClipIcon, 
  FaceSmileIcon 
} from '@heroicons/react/24/outline';

export default function ChatInput() {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { sendMessage, selectedUser, sendTyping } = useChat();
  const { user } = useAuth();
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Handle typing indicators
  useEffect(() => {
    if (message.trim() && !isTyping) {
      setIsTyping(true);
      sendTyping();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    if (message.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    } else {
      setIsTyping(false);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, sendTyping, isTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && selectedUser) {
      sendMessage(message.trim());
      setMessage('');
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileUpload = () => {
    // TODO: Implement file upload functionality
    console.log('File upload clicked');
  };

  const handleEmojiPicker = () => {
    // TODO: Implement emoji picker
    console.log('Emoji picker clicked');
  };

  if (!selectedUser) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border">
        <div className="text-center text-gray-500 dark:text-dark-textSecondary text-sm">
          Select a conversation to start messaging
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Message Input */}
        <div className="flex items-end space-x-2">
          {/* Attachment Button */}
          <button
            type="button"
            onClick={handleFileUpload}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border"
            title="Attach file"
          >
            <PaperClipIcon className="h-5 w-5" />
          </button>

          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${selectedUser.username}...`}
              rows={1}
              className="w-full resize-none border border-gray-300 dark:border-dark-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text"
              style={{
                minHeight: '44px',
                maxHeight: '120px'
              }}
            />
          </div>

          {/* Emoji Button */}
          <button
            type="button"
            onClick={handleEmojiPicker}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border"
            title="Add emoji"
          >
            <FaceSmileIcon className="h-5 w-5" />
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim()}
            className={`
              p-3 rounded-lg transition-all duration-200 flex items-center justify-center
              ${message.trim() 
                ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg transform hover:scale-105' 
                : 'bg-gray-100 dark:bg-dark-border text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }
            `}
            title="Send message"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Typing Status */}
        {isTyping && (
          <div className="text-xs text-gray-500 dark:text-dark-textSecondary px-2 animate-pulse">
            You are typing...
          </div>
        )}

        {/* Message Status */}
        <div className="text-xs text-gray-400 dark:text-gray-500 px-2">
          Press Enter to send, Shift+Enter for new line
        </div>
      </form>
    </div>
  );
}