import { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import EmojiPicker from 'emoji-picker-react';
import FileUpload from './FileUpload';
import { 
  PaperAirplaneIcon, 
  FaceSmileIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import axios from '../../api/axios';
import toast from 'react-hot-toast';

export default function ChatInput({ replyingTo, onCancelReply }) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedUser) return;

    // Handle file upload
    if (selectedFiles.length > 0) {
      await handleFileUpload();
      return;
    }

    // Handle text message
    if (message.trim()) {
      console.log('Submitting message:', message);
      console.log('Connection status:', isConnected);
      console.log('Socket available:', !!socket);
      
      sendMessage(message.trim(), null, replyingTo?._id);
      setMessage('');
      setIsTyping(false);
      if (onCancelReply) onCancelReply();
      inputRef.current?.focus();
    }
  };

  const handleFileUpload = async () => {
    if (selectedFiles.length === 0 || !selectedUser) return;

    setIsUploading(true);
    const uploadToast = toast.loading(`Uploading ${selectedFiles.length} file(s)...`);

    try {
      const uploadedMessages = [];
      
      // Upload each file sequentially
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        // Update progress for current file
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 0
        }));

        const formData = new FormData();
        formData.append('file', file);
        formData.append('receiverId', selectedUser._id);
        
        // Add caption only to the first file
        if (i === 0 && message.trim()) {
          formData.append('caption', message.trim());
        }

        console.log(`📤 Uploading file ${i + 1}/${selectedFiles.length}:`, file.name);

        const response = await axios.post('/file/upload', formData, {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(prev => ({
              ...prev,
              [file.name]: percentCompleted
            }));
            toast.loading(`Uploading ${i + 1}/${selectedFiles.length}... ${percentCompleted}%`, { id: uploadToast });
          }
        });

        console.log(`✅ File ${i + 1} uploaded successfully:`, response.data);
        const uploadedMessage = response.data.message;
        uploadedMessages.push(uploadedMessage);

        // IMPORTANT: Add the uploaded message to the sender's UI immediately
        sendMessage(null, uploadedMessage);

        // Emit socket event for real-time delivery to receiver
        if (socket && isConnected) {
          socket.emit('fileMessageSent', uploadedMessage._id);
        }
      }

      toast.success(`${selectedFiles.length} file(s) sent successfully!`, { id: uploadToast });

      // Clear state and local storage
      setSelectedFiles([]);
      setUploadProgress({});
      setMessage('');
      localStorage.removeItem('unsent_files_metadata');
      inputRef.current?.focus();
    } catch (error) {
      console.error('❌ File upload error:', error);
      toast.error(error.response?.data?.error || 'Failed to upload file', { id: uploadToast });
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
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

      <form onSubmit={handleSubmit} className="space-y-2">
        {/* Reply Preview */}
        {replyingTo && (
          <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-3 rounded">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                Replying to {replyingTo.sender.username}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                {replyingTo.content || '📎 Attachment'}
              </p>
            </div>
            <button
              type="button"
              onClick={onCancelReply}
              className="ml-2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Message Input */}
        <div className='w-full flex items-center'>
          <FileUpload 
            onFilesSelect={setSelectedFiles}
            selectedFiles={selectedFiles}
            disabled={isUploading || !isConnected}
          />
        <div className="flex w-full justify-center items-center space-x-2">
          {/* File Upload */}

          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={selectedFiles.length > 0 ? 'Add a caption (optional)...' : `Message ${selectedUser.username}...`}
              rows={1}
              disabled={isUploading}
              className="w-full resize-none border border-gray-300 dark:border-dark-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text disabled:opacity-50 disabled:cursor-not-allowed"
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
              <FaceSmileIcon className="h-8 w-8" />
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
            disabled={(!message.trim() && selectedFiles.length === 0) || isUploading}
            className={`
              p-3 rounded-lg transition-all duration-200 flex items-center justify-center
              ${(message.trim() || selectedFiles.length > 0) && !isUploading
                ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg transform hover:scale-105' 
                : 'bg-gray-100 dark:bg-dark-border text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }
            `}
            title={!isConnected ? 'Connecting to server...' : isUploading ? 'Uploading...' : 'Send message'}
          >
            {isUploading ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
            ) : (
              <PaperAirplaneIcon className="h-5 w-5" />
            )}
          </button>
        </div>
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