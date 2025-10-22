import { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import EmojiPicker from 'emoji-picker-react';
import { 
  PaperAirplaneIcon, 
  PaperClipIcon, 
  FaceSmileIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function ChatInput() {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { sendMessage, selectedUser, sendTyping, socket, isConnected, connect } = useChat();
  const { user } = useAuth();
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);

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
      console.log('Submitting message:', message);
      console.log('Connection status:', isConnected);
      console.log('Socket available:', !!socket);
      
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
    setShowEmojiPicker(!showEmojiPicker);
  };

  const onEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
    inputRef.current?.focus();
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target) && 
          !event.target.closest('[data-emoji-button]')) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRetryConnection = () => {
    console.log('Manual retry connection requested');
    if (user?.userId) {
      connect(user.userId);
    }
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
      {/* Connection Status */}
      {!isConnected && (
        <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm text-yellow-700 dark:text-yellow-300">
                Connecting to server...
              </span>
            </div>
            <button
              onClick={handleRetryConnection}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300 rounded hover:bg-yellow-200 dark:hover:bg-yellow-700 transition-colors"
            >
              <ArrowPathIcon className="h-3 w-3" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      )}

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
          <div className="relative">
            <button
              type="button"
              data-emoji-button
              onClick={handleEmojiPicker}
              className={`p-2 transition-colors rounded-lg ${
                showEmojiPicker 
                  ? 'text-primary-600 dark:text-primary-400 bg-gray-100 dark:bg-dark-border' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border'
              }`}
              title="Add emoji"
            >
              <FaceSmileIcon className="h-5 w-5" />
            </button>
            
            {/* Emoji Picker Popup */}
            {showEmojiPicker && (
              <div 
                ref={emojiPickerRef}
                className="absolute bottom-14 right-0 z-50 shadow-2xl rounded-lg overflow-hidden"
              >
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
                  emojiStyle="native"
                  width={320}
                  height={400}
                  searchPlaceHolder="Search emoji..."
                  previewConfig={{
                    showPreview: false
                  }}
                />
              </div>
            )}
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim() }
            className={`
              p-3 rounded-lg transition-all duration-200 flex items-center justify-center
              ${message.trim()
                ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg transform hover:scale-105' 
                : 'bg-gray-100 dark:bg-dark-border text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }
            `}
            title={!isConnected ? 'Connecting to server...' : 'Send message'}
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
          {!isConnected && ' • Connecting to server...'}
        </div>
      </form>
    </div>
  );
}