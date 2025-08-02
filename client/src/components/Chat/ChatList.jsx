import { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { formatDistanceToNow } from 'date-fns';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function ChatList({ onSelectUser }) {
  const { 
    users, 
    loading, 
    error, 
    selectUser, 
    selectedUser, 
    unreadCounts,
    typingUsers,
    onlineUsers,
    fetchUsers
  } = useChat();
  
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelect = (user) => {
    selectUser(user);
    if (onSelectUser) onSelectUser();
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = () => {
    fetchUsers();
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3 animate-pulse">
            <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-dark-border"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-dark-border rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-dark-border rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-500 dark:text-red-400 text-sm mb-3">
          Failed to load conversations
        </div>
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark-bg">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 dark:border-dark-border">
        <div className="relative">
          <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-3">
              <svg 
                className="h-8 w-8 text-primary-600 dark:text-primary-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" 
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-1">
              {searchQuery ? 'No users found' : 'No contacts yet'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-dark-textSecondary">
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : 'Create an account to start chatting'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-dark-border">
            {filteredUsers.map((user) => {
              const isTyping = typingUsers.has(user._id);
              const unreadCount = unreadCounts[user._id] || 0;
              const isSelected = selectedUser?._id === user._id;
              const isOnline = onlineUsers.has(user._id) || user.isOnline;

              return (
                <div
                  key={user._id}
                  className={`
                    p-4 flex items-center hover:bg-gray-50 dark:hover:bg-dark-surface transition-colors cursor-pointer
                    ${isSelected ? 'bg-primary-50 dark:bg-primary-900/20 border-r-2 border-primary-500' : ''}
                  `}
                  onClick={() => handleSelect(user)}
                >
                  {/* Avatar */}
                  <div className="relative mr-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center shadow-soft dark:shadow-soft-dark">
                      <span className="text-primary-600 dark:text-primary-400 font-semibold text-lg">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {isOnline && (
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white dark:border-dark-bg shadow-sm"></div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-medium text-gray-900 dark:text-dark-text truncate">
                        {user.username}
                      </h3>
                      <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap ml-2">
                        {user.lastSeen && formatDistanceToNow(new Date(user.lastSeen), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-500 dark:text-dark-textSecondary truncate flex-1">
                        {isTyping ? (
                          <span className="text-primary-600 dark:text-primary-400 font-medium animate-pulse">typing...</span>
                        ) : (
                          user.lastMessage?.content || 'Tap to start chatting'
                        )}
                      </p>
                      
                      {/* Unread Count */}
                      {unreadCount > 0 && (
                        <span className="ml-2 bg-primary-600 text-white text-xs font-medium h-5 w-5 flex items-center justify-center rounded-full min-w-[20px]">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Online Users Count */}
      {filteredUsers.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-dark-textSecondary">
            <span>
              {onlineUsers.size} online • {filteredUsers.length} total
            </span>
            <button
              onClick={handleRefresh}
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
            >
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
}