import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import {
  CheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import FileMessage from './FileMessage';

export default function Message({ message, isOwnMessage, showAvatar, onDeleteMessage, onReplyMessage }) {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Message status component
  const MessageStatus = ({ status }) => {
    const statusConfig = {
      sent: { icon: CheckIcon, color: 'text-gray-200 dark:text-gray-200' },
      delivered: { icon: CheckIcon, color: 'text-blue-500 dark:text-blue-500' },
      read: { icon: CheckCircleIcon, color: 'text-green-300 dark:text-green-300' },
      failed: { icon: ExclamationTriangleIcon, color: 'text-red-500 dark:text-red-400' }
    };

    const config = statusConfig[status] || statusConfig.sent;
    const Icon = config.icon;

    return (
      <Icon className={`h-3 w-3 ml-1 ${config.color}`} />
    );
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDeleteMessage(message._id);
    setShowDeleteConfirm(false);
    setShowMenu(false);
  };

  const handleReply = () => {
    onReplyMessage(message);
    setShowMenu(false);
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4 animate-slide-up group`}>
      <div className="flex items-end space-x-2 max-w-xs lg:max-w-md">
        {/* Avatar for received messages */}
        {!isOwnMessage && showAvatar && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center">
              <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm">
                {message.sender.username?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* Message bubble */}
        <div className="relative">
          {/* Action buttons - show on hover */}
          <div className={`absolute -top-8 ${isOwnMessage ? 'right-0' : 'left-0'} flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-700 rounded-lg shadow-lg p-1`}>
            <button
              onClick={handleReply}
              className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
              title="Reply"
            >
              <ArrowUturnLeftIcon className="w-4 h-4" />
            </button>
            {isOwnMessage && (
              <button
                onClick={handleDelete}
                className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                title="Delete"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Delete confirmation modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDeleteConfirm(false)}>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Message?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  This message will be deleted for everyone. This action cannot be undone.
                </p>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          <div
            className={`
              rounded-2xl shadow-soft dark:shadow-soft-dark relative
              ${isOwnMessage 
                ? 'bg-primary-900 text-white rounded-br-md' 
                : 'bg-gray-100 dark:bg-dark-surface text-gray-800 dark:text-dark-text rounded-bl-md border border-gray-200 dark:border-dark-border'
              }
              ${message.fileUrl ? 'p-2' : 'px-4 py-2'}
            `}
          >
            {/* Replied message preview */}
            {message.repliedTo && (
              <div className="mb-2 p-2 border-l-2 border-blue-500 bg-gray-50 dark:bg-gray-700/50 rounded-r text-xs">
                <p className="text-blue-600 dark:text-blue-400 font-medium mb-1">
                  {message.repliedTo.sender?.username || 'Unknown'}
                </p>
                <p className="text-gray-600 dark:text-gray-300 truncate">
                  {message.repliedTo.content || '📎 Attachment'}
                </p>
              </div>
            )}

            {/* File attachment */}
            {message.fileUrl ? (
              <FileMessage 
                message={message} 
                isOwnMessage={isOwnMessage}
                onDelete={onDeleteMessage}
              />
            ) : (
              <>
                {/* Text message content */}
                <p className="text-sm break-words whitespace-pre-wrap">
                  {message.content}
                </p>
              </>
            )}
            
            {/* Message metadata */}
            <div className="flex justify-end items-center mt-1 space-x-1">
              <span className={`text-xs ${isOwnMessage ? 'text-primary-200' : 'text-gray-500 dark:text-dark-textSecondary'}`}>
                {format(new Date(message.createdAt), 'h:mm a')}
              </span>
              {isOwnMessage && <MessageStatus status={message.status} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}