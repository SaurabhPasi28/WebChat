import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { format } from 'date-fns';
import {
  CheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  FaceSmileIcon,
  PencilIcon,
  TrashIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';

const reactions = ['👍', '❤️', '😂', '😮', '😢', '👎'];

export default function Message({ message, isOwnMessage, showAvatar, isLastMessage }) {
  const { user } = useAuth();
  const { socket, isConnected } = useChat();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [showReactions, setShowReactions] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [localReactions, setLocalReactions] = useState(message.reactions || []);

  // Update local reactions when message updates
  useEffect(() => {
    setLocalReactions(message.reactions || []);
  }, [message.reactions]);

  // Handle message editing
  const handleEdit = () => {
    if (!editedContent.trim()) return;
    
    if (socket && isConnected) {
      socket.emit('editMessage', {
        messageId: message._id,
        newContent: editedContent,
        userId: user.userId,
        receiverId: message.receiver._id
      });
      setIsEditing(false);
    }
  };

  // Handle message deletion
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      if (socket && isConnected) {
        socket.emit('deleteMessage', {
          messageId: message._id,
          userId: user.userId,
          receiverId: message.receiver._id
        });
      }
      setShowOptions(false);
    }
  };

  // Handle adding reaction
  const handleReaction = (emoji) => {
    if (socket && isConnected) {
      socket.emit('messageReaction', {
        messageId: message._id,
        emoji,
        userId: user.userId,
        receiverId: message.receiver._id
      });
      setShowReactions(false);
    }
  };

  // Message status component
  const MessageStatus = ({ status }) => {
    const statusConfig = {
      sent: { icon: CheckIcon, color: 'text-gray-400' },
      delivered: { icon: CheckIcon, color: 'text-blue-500' },
      read: { icon: CheckCircleIcon, color: 'text-blue-600' },
      failed: { icon: ExclamationTriangleIcon, color: 'text-red-500' }
    };

    const config = statusConfig[status] || statusConfig.sent;
    const Icon = config.icon;

    return (
      <Icon className={`h-3 w-3 ml-1 ${config.color}`} />
    );
  };

  // If message is being edited
  if (isEditing) {
    return (
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className="max-w-xs lg:max-w-md bg-white border border-indigo-300 rounded-lg shadow-sm">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            autoFocus
            rows={3}
          />
          <div className="flex justify-end space-x-2 p-3 border-t">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleEdit}
              className="px-3 py-1 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4 group`}>
      <div className="flex items-end space-x-2 max-w-xs lg:max-w-md">
        {/* Avatar for received messages */}
        {!isOwnMessage && showAvatar && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
              <span className="text-indigo-600 font-semibold text-sm">
                {message.sender.username?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* Message bubble */}
        <div className="relative">
          <div
            className={`
              px-4 py-2 rounded-2xl shadow-sm relative
              ${isOwnMessage 
                ? 'bg-indigo-600 text-white rounded-br-md' 
                : 'bg-gray-100 text-gray-800 rounded-bl-md'
              }
            `}
          >
            {/* Message content */}
            <p className="text-sm break-words whitespace-pre-wrap">
              {message.content}
            </p>
            
            {/* Message metadata */}
            <div className="flex justify-end items-center mt-1 space-x-1">
              <span className={`text-xs ${isOwnMessage ? 'text-indigo-200' : 'text-gray-500'}`}>
                {format(new Date(message.createdAt), 'h:mm a')}
              </span>
              {isOwnMessage && <MessageStatus status={message.status} />}
            </div>
            
            {/* Message reactions */}
            {localReactions.length > 0 && (
              <div className="flex flex-wrap justify-end gap-1 mt-2">
                {localReactions.map((reaction, i) => (
                  <button
                    key={i}
                    onClick={() => handleReaction(reaction.emoji)}
                    className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full hover:bg-opacity-30 transition-colors"
                  >
                    {reaction.emoji} {reaction.count > 1 ? reaction.count : ''}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Message actions for own messages */}
          {isOwnMessage && (
            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 bg-white rounded-full shadow-lg p-1 border border-gray-200">
              <button
                onClick={() => setShowReactions(!showReactions)}
                className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors"
                title="Add reaction"
              >
                <FaceSmileIcon className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors"
                title="Edit message"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowOptions(!showOptions)}
                  className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors"
                  title="More options"
                >
                  <EllipsisHorizontalIcon className="h-4 w-4" />
                </button>
                
                {showOptions && (
                  <div className="absolute right-0 bottom-full mb-2 w-40 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <button
                      onClick={handleDelete}
                      className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Delete Message
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reaction picker */}
          {showReactions && (
            <div className="absolute bottom-full right-0 mb-2 flex space-x-1 p-2 bg-white rounded-full shadow-lg border border-gray-200 z-10">
              {reactions.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="text-lg hover:scale-125 transform transition-transform p-1 rounded-full hover:bg-gray-100"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}