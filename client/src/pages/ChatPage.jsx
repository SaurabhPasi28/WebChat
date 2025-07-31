import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import axios from 'axios';

export default function ChatPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Handle incoming WebSocket messages
  const handleMessage = (wsMessage) => {
    if (wsMessage.type === 'private_message' && 
        (wsMessage.from === selectedUser || wsMessage.from === user.id)) {
      setMessages(prev => [...prev, {
        _id: Date.now().toString(),
        from: wsMessage.from,
        fromUsername: wsMessage.fromUsername,
        content: wsMessage.content,
        timestamp: new Date(wsMessage.timestamp),
        isMe: wsMessage.from === user.id
      }]);
    }
  };

  const { sendMessage, isConnected } = useWebSocket(user?.token, handleMessage);

  // Fetch users
// In src/pages/ChatPage.jsx
useEffect(() => {
  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users', {
        headers: { 
          Authorization: `Bearer ${user.token}` // Use token from user object
        }
      });
      setUsers(response.data.filter(u => u._id !== user.id));
    } catch (error) {
      console.error('Failed to fetch users', error);
      // If unauthorized, force logout
      if (error.response?.status === 401) {
        logout();
        navigate('/');
      }
    }
  };
  
  if (user?.token) { // Only fetch if we have a token
    fetchUsers();
  }
}, [user, navigate, logout]); // Add dependencies

  // Fetch messages when user changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return;
      
      setIsLoadingMessages(true);
      try {
        const response = await axios.get(`/api/messages/${selectedUser}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        
        setMessages(response.data.map(msg => ({
          ...msg,
          isMe: msg.from._id === user.id,
          fromUsername: msg.from.username
        })));
      } catch (error) {
        console.error('Failed to fetch messages', error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedUser, user]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedUser) return;
    
    const messageData = {
      type: 'private_message',
      to: selectedUser,
      content: message
    };

    if (sendMessage(messageData)) {
      setMessages(prev => [...prev, {
        _id: Date.now().toString(),
        from: user.id,
        fromUsername: user.username,
        content: message,
        timestamp: new Date(),
        isMe: true
      }]);
      setMessage('');
    } else {
      alert('Message failed to send. Please check your connection.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen  bg-gray-200">
      {/* Sidebar */}
      <div className="w-1/4 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">Chat App</h1>
            <button 
              onClick={handleLogout}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Logout
            </button>
          </div>
          <div className="flex items-center mt-2">
            <div className={`h-3 w-3 rounded-full mr-2 ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <p className="text-sm text-gray-500">
              {isConnected ? 'Connected' : 'Disconnected'} as {user?.username}
            </p>
          </div>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          <h2 className="font-medium mb-2">Users</h2>
          <ul>
            {users.map(u => (
              <li 
                key={u._id} 
                className={`p-2 cursor-pointer rounded mb-1 flex items-center ${
                  selectedUser === u._id ? 'bg-blue-100' : 'hover:bg-gray-100'
                }`}
                onClick={() => setSelectedUser(u._id)}
              >
                <span className="flex-1">{u.username}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <div className="p-4 border-b bg-white">
              <h2 className="font-semibold">
                {users.find(u => u._id === selectedUser)?.username}
              </h2>
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {isLoadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex justify-center items-center h-full text-gray-500">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg) => (
                  <div 
                    key={msg._id} 
                    className={`mb-4 ${msg.isMe ? 'text-right' : 'text-left'}`}
                  >
                    <div className="text-xs text-gray-500 mb-1">
                      {msg.fromUsername} • {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                    <div className={`inline-block p-3 rounded-lg max-w-xs lg:max-w-md ${
                      msg.isMe ? 'bg-blue-500 text-white' : 'bg-white border'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t bg-white">
              <div className="flex">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 border rounded-l-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Type a message..."
                  disabled={!isConnected}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || !isConnected}
                  className={`px-4 rounded-r-lg ${
                    isConnected 
                      ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center p-6 max-w-md">
              <h2 className="text-xl font-semibold mb-2">Welcome to Chat App</h2>
              <p className="text-gray-600">
                {users.length > 0 
                  ? "Select a user to start chatting" 
                  : "No other users available"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}