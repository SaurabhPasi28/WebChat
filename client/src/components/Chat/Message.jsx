import { useState,useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useChat } from '../../context/ChatContext.jsx';
import { format } from 'date-fns';
import {
  PaperAirplaneIcon,
  PencilIcon,
  TrashIcon,
  FaceSmileIcon,        // this replaces SmileIcon in v2
  ArrowUturnLeftIcon,   // this replaces ReplyIcon in v2
  EllipsisHorizontalIcon // this replaces DotsHorizontalIcon in v2
} from '@heroicons/react/24/solid';

const reactions = ['👍', '❤️', '😂', '😮', '😢', '👎'];

export default function Message({ message }) {
  const { user } = useAuth();
  const { socket, selectedUser,isConnected } = useChat();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [showReactions, setShowReactions] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [localReactions, setLocalReactions] = useState(message.reactions || []);
  const [socketError, setSocketError] = useState(null);
  // Check if current user is the sender
  const isSender = 
    (typeof message.sender === 'object' && message.sender._id === user.userId) ||
    (typeof message.sender === 'string' && message.sender === user.userId);


      useEffect(() => {
    if (socket) {
      socket.on('updateReactions', (updatedMessage) => {
        if (updatedMessage._id === message._id) {
          setLocalReactions(updatedMessage.reactions || []);
        }
      });
    }

    return () => {
      if (socket) socket.off('updateReactions');
    };
  }, [socket, message._id]);

    // Safe socket operations
  const safeSocketEmit = (event, data) => {
    if (!socket || !isConnected) {
      setSocketError('Socket connection not available');
      return false;
    }
    try {
      console.log("handle reaction4")

      socket.emit(event, data);
      console.log("handle reaction5")
      return true;
    } catch (error) {
      setSocketError(`Failed to send ${event}: ${error.message}`);
      return false;
    }
  };

  
  // Handle message editing
  const handleEdit = () => {
    if (!editedContent.trim()) return;
    
    const success = safeSocketEmit('editMessage', {
      messageId: message._id,
      newContent: editedContent,
      userId: user.userId
    });
    
    if (success) {
      setIsEditing(false);
      setSocketError(null);
    }
  };

  // Handle message deletion
    const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      safeSocketEmit('deleteMessage', {
        messageId: message._id,
        userId: user.userId
      });
      setShowOptions(false);
    }
  };

  // Handle adding reaction
  const handleReaction = (emoji) => {
    console.log("handle reaction")
    const success = safeSocketEmit('messageReaction', {
      messageId: message._id,
      emoji,
      userId: user.userId,
      chatId: message.receiver._id
    });
     console.log("handle reaction2")
    if (success) {
      console.log("handle reaction3")
      setShowReactions(false);
      setSocketError(null);
    }
  };

  // Message status component
  const MessageStatus = ({ status }) => {
    const statusIcons = {
      sent: '✉️',
      delivered: '✓',
      read: '✓✓',
      error: '⚠️'
    };

    return (
      <span className="ml-1 text-xs opacity-75">
        {statusIcons[status] || statusIcons.sent}
      </span>
    );
  };


    useEffect(() => {
    if (!isConnected) {
      setSocketError('Disconnected from chat server');
    } else {
      setSocketError(null);
    }
  }, [isConnected]);

  // If message is being edited
  if (isEditing) {
    return (
      <div className={`flex mb-4 ${isSender ? 'justify-end' : 'justify-start'}`}>
        <div className="max-w-xs lg:max-w-md w-full bg-white border border-indigo-300 rounded-lg shadow-sm">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            autoFocus
            rows={3}
          />
          <div className="flex justify-end space-x-2 p-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleEdit}
              className="px-3 py-1 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal message display
  return (
    <div className={`flex mb-4 ${isSender ? 'justify-end' : 'justify-start'} group`}>
      <div className="relative">
        <div
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
            isSender
              ? 'bg-indigo-600 text-white rounded-br-none'
              : 'bg-gray-100 text-gray-800 rounded-bl-none'
          } shadow-sm relative`}
        >
          {/* Message content */}
          <p className="text-sm break-words">{message.content}</p>
          
          {/* Message metadata */}
          <div className="flex justify-end items-center mt-1">
            <p className={`text-xs ${isSender ? 'text-indigo-200' : 'text-gray-500'}`}>
              {format(new Date(message.createdAt), 'h:mm a')}
            </p>
            {isSender && <MessageStatus status={message.status} />}
          </div>
          
          {/* Message reactions */}
          {message.reactions?.length > 0 && (
            <div className="flex flex-wrap justify-end gap-1 mt-1">
              {message.reactions.map((reaction, i) => (
                <button
                  key={i}
                  onClick={() => handleReaction(reaction.emoji)}
                  className="text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded hover:bg-gray-200"
                >
                  {reaction.emoji} {reaction.count > 1 ? reaction.count : ''}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Message actions */}
        {isSender && (
          <div className="absolute -top-4 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 bg-white rounded-full shadow-sm p-1 border border-gray-200">
            <button
              onClick={() => setShowReactions(!showReactions)}
              className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-full"
            >
              <FaceSmileIcon className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-full"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-full"
              >
                <EllipsisHorizontalIcon className="h-4 w-4" />
              </button>
              
              {showOptions && (
                <div className="absolute right-0 bottom-full mb-1 w-40 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <button
                    onClick={handleDelete}
                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
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
          <div className="absolute bottom-full right-0 mb-2 flex space-x-1 p-1 bg-white rounded-full shadow-lg border border-gray-200 z-10">
            {reactions.map(emoji => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="text-lg hover:scale-125 transform transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}