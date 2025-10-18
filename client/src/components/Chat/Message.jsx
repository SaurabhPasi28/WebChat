import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import {
  CheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function Message({ message, isOwnMessage, showAvatar }) {
  const { user } = useAuth();

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

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4 animate-slide-up`}>
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
          <div
            className={`
              px-4 py-2 rounded-2xl shadow-soft dark:shadow-soft-dark relative
              ${isOwnMessage 
                ? 'bg-primary-900 text-white rounded-br-md' 
                : 'bg-gray-100 dark:bg-dark-surface text-gray-800 dark:text-dark-text rounded-bl-md border border-gray-200 dark:border-dark-border'
              }
            `}
          >
            {/* Message content */}
            <p className="text-sm break-words whitespace-pre-wrap">
              {message.content}
            </p>
            
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