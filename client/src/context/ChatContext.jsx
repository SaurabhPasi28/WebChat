import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useSocket } from '../services/socket.js';
import { getUsers, getMessages } from '../services/api.js';
import { useAuth } from './AuthContext.jsx';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket, isConnected, connectionError } = useSocket();
  const [isReady, setIsReady] = useState(false);
  // const [messages, setMessages] = useState([]);
const tempMessages = useRef({});

   // Add socket connection check
  // Wait until socket is fully initialized
  // Verify socket is fully ready,
  useEffect(() => {
    if (socket && isConnected && !connectionError) {
      setIsReady(true);
    } else {
      setIsReady(false);
    }
  }, [socket, isConnected, connectionError]);

  //  console.error("Socket connection established!");
  // State declarations
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  
  // Refs for timeouts
  const typingTimeout = useRef(null);
  const messageStatusTimeout = useRef(null);


    // Add to socket effects:
  useEffect(() => {
    if (socket) {
      socket.on('userStatusChanged', ({ userId, isOnline }) => {
        setUsers(prev => prev.map(user => 
          user._id === userId ? { ...user, isOnline } : user
        ));
        setOnlineUsers(prev => 
          isOnline 
            ? [...prev, userId]
            : prev.filter(id => id !== userId)
        );
      });

      socket.on('updateReactions', (updatedMessage) => {
        setMessages(prev => prev.map(msg =>
          msg._id === updatedMessage._id ? updatedMessage : msg
        ));
      });

      return () => {
        socket.off('userStatusChanged');
        socket.off('updateReactions');
      };
    }
  }, [socket]); 
     useEffect(() => {
    if (socket && isConnected) {
      // Set up all socket listeners here
      const messageHandler = (message) => {
        // Handle new message
      };

      socket.on('receiveMessage', messageHandler);

      // Mark socket as ready
      setIsReady(true);

      return () => {
        socket.off('receiveMessage', messageHandler);
      };
    }
  }, [socket, isConnected]);


  // Fetch users and setup socket listeners
  useEffect(() => {
    if (user) {
      fetchUsers();
      setupSocketListeners();
    }

    return () => {
      if (socket) {
        socket.off('receiveMessage');
        socket.off('typing');
        socket.off('stopTyping');
        socket.off('updateReactions');
        socket.off('messageEdited');
        socket.off('messageDeleted');
      }
      clearTimeout(typingTimeout.current);
      clearTimeout(messageStatusTimeout.current);
    };
  }, [user, socket]);

  const setupSocketListeners = () => {
    socket.on('receiveMessage', handleNewMessage);
    socket.on('typing', handleTyping);
    socket.on('stopTyping', handleStopTyping);
    socket.on('updateReactions', handleReactionUpdate);
    socket.on('messageEdited', handleMessageEdited);
    socket.on('messageDeleted', handleMessageDeleted);
  };

  // Fetch all users except current user
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for selected user
  const fetchMessages = async (receiverId) => {
    try {
      setLoading(true);
      const data = await getMessages(receiverId);
      setMessages(data);
      setError(null);
      
      // Mark messages as read
      if (data.length > 0) {
        socket.emit('markAsRead', {
          senderId: receiverId,
          receiverId: user.userId
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle incoming new message
  const handleNewMessage = (message) => {
    setMessages(prev => {
      // Replace temp message if exists
      const filtered = prev.filter(m => !m.isTemp || m._id !== message._id);
      return [...filtered, message];
    });

    // Update unread count if not current chat
    if (selectedUser?._id !== message.sender._id) {
      setUnreadCounts(prev => ({
        ...prev,
        [message.sender._id]: (prev[message.sender._id] || 0) + 1
      }));
    }
  };

  // Handle typing indicators
  const handleTyping = (userId) => {
    setTypingUsers(prev => [...new Set([...prev, userId])]);
  };

  const handleStopTyping = (userId) => {
    setTypingUsers(prev => prev.filter(id => id !== userId));
  };

  // Handle message reactions
  const handleReactionUpdate = (updatedMessage) => {
    setMessages(prev => 
      prev.map(msg => 
        msg._id === updatedMessage._id ? updatedMessage : msg
      )
    );
  };

  // Handle edited messages
  const handleMessageEdited = (editedMessage) => {
    setMessages(prev =>
      prev.map(msg =>
        msg._id === editedMessage._id ? editedMessage : msg
      )
    );
  };

  // Handle deleted messages
  const handleMessageDeleted = (deletedMessageId) => {
    setMessages(prev => prev.filter(msg => msg._id !== deletedMessageId));
  };

  // Select a user to chat with
  const selectUser = (user) => {
    setSelectedUser(user);
    setUnreadCounts(prev => ({ ...prev, [user._id]: 0 }));
    fetchMessages(user._id);
  };

// Add to socket effects:
useEffect(() => {
  if (socket) {
    socket.on('userStatusChanged', ({ userId, isOnline }) => {
      setUsers(prev => prev.map(user => 
        user._id === userId ? { ...user, isOnline } : user
      ));
      setOnlineUsers(prev => 
        isOnline 
          ? [...prev, userId]
          : prev.filter(id => id !== userId)
      );
    });

    socket.on('updateReactions', (updatedMessage) => {
      setMessages(prev => prev.map(msg =>
        msg._id === updatedMessage._id ? updatedMessage : msg
      ));
    });

    return () => {
      socket.off('userStatusChanged');
      socket.off('updateReactions');
    };
  }
}, [socket]);

  // Typing indicator handler
  const sendTyping = () => {
    if (socket && selectedUser) {
      socket.emit('typing', selectedUser._id);
      
      // Clear previous timeout
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
      
      // Set new timeout
      typingTimeout.current = setTimeout(() => {
        socket.emit('stopTyping', selectedUser._id);
      }, 3000);
    }
  };

  // Message search functionality
  const searchMessages = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const results = messages.filter(msg => 
      msg.content.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
  };

    // Send a new message
  const sendMessage = (content) => {
    if (socket && selectedUser && user && content.trim()) {
      // Create temporary message for immediate UI update
      const tempMessage = {
        _id: Date.now().toString(),
        sender: { _id: user.userId, username: user.username },
        receiver: selectedUser._id,
        content,
        createdAt: new Date().toISOString(),
        isTemp: true,
        status: 'sent'
      };
      
      // Add to messages immediately
      setMessages(prev => [...prev, tempMessage]);
      
      // Send via socket
      socket.emit('sendMessage', {
        senderId: user.userId,
        receiverId: selectedUser._id,
        content
      });

      // Update message status after delay
      messageStatusTimeout.current = setTimeout(() => {
        setMessages(prev =>
          prev.map(msg =>
            msg._id === tempMessage._id 
              ? { ...msg, status: 'delivered' } 
              : msg
          )
        );
      }, 1000);
    }
  };

  // Context value
  const value = {
    users,
    selectedUser,
    messages,
    loading,
    error,
    typingUsers,
    unreadCounts,
    searchQuery,
    searchResults,
    fetchUsers,
    selectUser,
    sendMessage,
    sendTyping,
    searchMessages,
    socket,
    isConnected,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);