import { useState, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import ChatList from './ChatList';
import ChatArea from './ChatArea';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Header from '../Layout/Header';

export default function ChatContainer() {
  const { selectedUser, users, loading, error, clearError } = useChat();
  const { user, logout } = useAuth();
  const [isMobileListOpen, setIsMobileListOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-hide sidebar on mobile when user is selected
  useEffect(() => {
    if (selectedUser && window.innerWidth < 768) {
      setIsMobileListOpen(false);
    }
  }, [selectedUser]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen  border-green-600 bg-gray-100">
      <Header/>
      {/* Header for mobile */}
      <div className="md:hidden  relative top-0 left-0 right-0 z-20 bg-white  border-0  border-red-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex  items-center space-x-3">
            <button
              onClick={() => setIsMobileListOpen(!isMobileListOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMobileListOpen ? (
                <XMarkIcon className="h-5 w-5 text-gray-600" />
              ) : (
                <Bars3Icon className="h-5 w-5 text-gray-600" />
              )}
            </button>
            <h1 className="text-lg font-semibold text-gray-900">WebChat</h1>
          </div>
          <div className="flex items-center  space-x-2">
            <span className="text-sm text-gray-600">Hi, {user?.username}</span>
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </div>
      
    <div className="flex relative h-[calc(100vh-4rem)] border-0  border-black  bg-gray-50">

      {/* Chat List Sidebar */}
      <div 
        className={`
          ${isMobileListOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
          fixed md:relative left-0 z-10 w-80 bg-white border-0  border-green-600
          transform transition-transform duration-300 ease-in-out md:transform-none h-[calc(100vh-4rem)]
        `}
      >
        <div className="flex flex-col h-full">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between p-4 border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Hi, {user?.username}</span>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-hidden">
            <ChatList onSelectUser={() => setIsMobileListOpen(false)} />
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 border-0  border-blue-600 flex flex-col md:ml-0">
        {selectedUser ? (
          <ChatArea onBack={() => setIsMobileListOpen(true)} />
        ) : (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg 
                  className="w-10 h-10 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to WebChat
              </h2>
              <p className="text-gray-600 mb-6">
                Select a conversation from the sidebar to start chatting
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>✨ Real-time messaging</p>
                <p>👥 See who's online</p>
                <p>💬 Typing indicators</p>
                <p>📱 Responsive design</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="ml-4 text-white hover:text-gray-200"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            <span className="text-gray-700">Loading...</span>
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      {isMobileListOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-5"
          onClick={() => setIsMobileListOpen(false)}
        />
      )}
    </div>
    </div>
  );
}