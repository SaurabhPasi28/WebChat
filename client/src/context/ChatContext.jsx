import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../services/socket.js';
import { chatAPI } from '../services/api.js';
import { useAuth } from './AuthContext.jsx';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket, isConnected, connect } = useSocket();
  
  // State declarations
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [unreadCounts, setUnreadCounts] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  
  // Refs for timeouts and connection tracking
  const typingTimeout = useRef(null);
  const messageStatusTimeout = useRef(null);
  const connectedUserRef = useRef(null);

  // Fetch all users except current user
  const fetchUsers = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await chatAPI.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Handle incoming new message
  const handleNewMessage = useCallback((message) => {
    // console.log('📨 Received new message:', message);
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
  }, [selectedUser]);

  // Handle typing indicators
  const handleTyping = useCallback((userId) => {
    // console.log('⌨️ User typing:', userId);
    setTypingUsers(prev => new Set([...prev, userId]));
  }, []);

  const handleStopTyping = useCallback((userId) => {
    // console.log('⌨️ User stopped typing:', userId);
    setTypingUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  }, []);

  // Handle user status changes
  const handleUserStatusChange = useCallback(({ userId, isOnline }) => {
    // console.log('👤 User status changed:', userId, isOnline);
    setUsers(prev => prev.map(user => 
      user._id === userId ? { ...user, isOnline } : user
    ));
    
    setOnlineUsers(prev => {
      const newSet = new Set(prev);
      if (isOnline) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  }, []);

  // Handle messages read
  const handleMessagesRead = useCallback(({ readerId }) => {
    // console.log('📖 Messages read by:', readerId);
    setMessages(prev => 
      prev.map(msg => 
        msg.sender._id === readerId ? { ...msg, status: 'read' } : msg
      )
    );
  }, []);

  // Setup socket listeners
  const setupSocketListeners = useCallback(() => {
    if (!socket) {
      console.log('❌ No socket available for setting up listeners');
      return;
    }
    
    // console.log('🔧 Setting up socket listeners...');
    
    // Remove existing listeners to prevent duplicates
    socket.off('receiveMessage');
    socket.off('typing');
    socket.off('stopTyping');
    socket.off('userStatusChanged');
    socket.off('messagesRead');
    
    // Message handling
    socket.on('receiveMessage', handleNewMessage);
    
    // Typing indicators
    socket.on('typing', handleTyping);
    socket.on('stopTyping', handleStopTyping);
    
    // User status changes
    socket.on('userStatusChanged', handleUserStatusChange);
    
    // Message read receipts
    socket.on('messagesRead', handleMessagesRead);
    
    console.log('✅ Socket listeners set up successfully');
  }, [socket, handleNewMessage, handleTyping, handleStopTyping, handleUserStatusChange, handleMessagesRead]);

  // Initialize chat when user is authenticated
  useEffect(() => {
    if (user) {
      console.log('👤 User authenticated, fetching users...');
      fetchUsers();
    }
  }, [user, fetchUsers]);

  // Connect socket when user is authenticated (only once per user)
  useEffect(() => {
    if (user?.userId && connectedUserRef.current !== user.userId) {
      console.log('🔌 User authenticated, connecting socket for:', user.userId);
      connectedUserRef.current = user.userId;
      connect(user.userId);
    }
  }, [user?.userId, connect]);

  // Setup socket listeners when socket is connected
  useEffect(() => {
    if (socket && isConnected && user) {
      console.log('🔧 Socket connected, setting up listeners...');
      setupSocketListeners();
    }
  }, [socket, isConnected, user, setupSocketListeners]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        console.log('🧹 Cleaning up socket listeners...');
        socket.off('receiveMessage');
        socket.off('typing');
        socket.off('stopTyping');
        socket.off('userStatusChanged');
        socket.off('messagesRead');
      }
      clearTimeout(typingTimeout.current);
      clearTimeout(messageStatusTimeout.current);
    };
  }, [socket]);

  // Fetch messages for selected user
  const fetchMessages = async (receiverId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await chatAPI.getMessages(receiverId);
      setMessages(data);
      
      // Mark messages as read
      if (data.length > 0 && socket && isConnected) {
        console.log('📖 Marking messages as read for:', receiverId);
        socket.emit('markAsRead', {
          senderId: receiverId,
          receiverId: user.userId
        });
      }
      
      // Clear unread count for this user
      setUnreadCounts(prev => ({ ...prev, [receiverId]: 0 }));
    } catch (err) {
      setError(err.message);
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  // Select a user to chat with
  const selectUser = useCallback((user) => {
    console.log('👤 Selecting user:', user.username);
    setSelectedUser(user);
    fetchMessages(user._id);
  }, [user?.userId]);

  // Typing indicator handler
  const sendTyping = useCallback(() => {
    if (socket && selectedUser && isConnected) {
      console.log('⌨️ Sending typing indicator to:', selectedUser._id);
      socket.emit('typing', selectedUser._id);
      
      // Clear previous timeout
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
      
      // Set new timeout
      typingTimeout.current = setTimeout(() => {
        console.log('⌨️ Stopping typing indicator for:', selectedUser._id);
        socket.emit('stopTyping', selectedUser._id);
      }, 3000);
    } else {
      console.log('❌ Cannot send typing indicator - socket:', !!socket, 'selectedUser:', !!selectedUser, 'isConnected:', isConnected);
    }
  }, [socket, selectedUser, isConnected]);

  // Message search functionality
  const searchMessages = useCallback((query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const results = messages.filter(msg => 
      msg.content.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
  }, [messages]);

  // Send a new message
  // const sendMessage = useCallback((content) => {
  //   console.log('📤 Attempting to send message:', content);
  //   console.log('🔌 Socket available:', !!socket, 'Selected user:', !!selectedUser, 'User:', !!user, 'Connected:', isConnected);
    
  //   if (socket && selectedUser && user && content.trim() && isConnected) {
  //     console.log('📤 Sending message via socket...');
      
  //     // Create temporary message for immediate UI update
  //     const tempMessage = {
  //       _id: Date.now().toString(),
  //       sender: { _id: user.userId, username: user.username },
  //       receiver: selectedUser._id,
  //       content,
  //       createdAt: new Date().toISOString(),
  //       isTemp: true,
  //       status: 'sent'
  //     };
      
  //     // Add to messages immediately
  //     setMessages(prev => [...prev, tempMessage]);
      
  //     // Send via socket
  //     socket.emit('sendMessage', {
  //       senderId: user.userId,
  //       receiverId: selectedUser._id,
  //       content
  //     });

  //     // Update message status after delay
  //     messageStatusTimeout.current = setTimeout(() => {
  //       setMessages(prev =>
  //         prev.map(msg =>
  //           msg._id === tempMessage._id 
  //             ? { ...msg, status: 'delivered' } 
  //             : msg
  //         )
  //       );
  //     }, 1000);
  //   } 
  //   else {
  //     console.error('❌ Cannot send message - missing requirements');
  //     console.error('Socket:', !!socket);
  //     console.error('Selected user:', !!selectedUser);
  //     console.error('User:', !!user);
  //     console.error('Content:', !!content);
  //     console.error('Connected:', isConnected);
      
  //     // Try to reconnect if not connected
  //     if (!isConnected && user?.userId) {
  //       console.log('🔄 Attempting to reconnect socket...');
  //       connect(user.userId);
  //     }
  //   }
  // }, [socket, selectedUser, user, isConnected, connect]);

  const UNSENT_MESSAGES_KEY = 'unsentMessages';

const sendMessage = useCallback((content) => {
  const payload = {
    senderId: user.userId,
    receiverId: selectedUser?._id,
    content,
    createdAt: new Date().toISOString()
  };

  if (socket && isConnected && selectedUser && user && content.trim()) {
    console.log('📤 Sending message via socket...');

    const tempMessage = {
      _id: Date.now().toString(),
      sender: { _id: user.userId, username: user.username },
      receiver: selectedUser._id,
      content,
      createdAt: payload.createdAt,
      isTemp: true,
      status: 'sent'
    };

    setMessages(prev => [...prev, tempMessage]);

    socket.emit('sendMessage', payload);

    messageStatusTimeout.current = setTimeout(() => {
      setMessages(prev =>
        prev.map(msg =>
          msg._id === tempMessage._id ? { ...msg, status: 'delivered' } : msg
        )
      );
    }, 1000);
  } else {
    console.warn('⚠️ Socket not connected, saving message locally');

    const unsent = JSON.parse(localStorage.getItem(UNSENT_MESSAGES_KEY)) || [];
    localStorage.setItem(UNSENT_MESSAGES_KEY, JSON.stringify([...unsent, payload]));

    // Try reconnect
    if (!isConnected && user?.userId) {
      connect(user.userId);
    }
  }
}, [socket, selectedUser, user, isConnected, connect]);

useEffect(() => {
  if (isConnected && socket && user) {
    const unsent = JSON.parse(localStorage.getItem(UNSENT_MESSAGES_KEY)) || [];

    if (unsent.length > 0) {
      console.log('📤 Resending unsent messages:', unsent.length);

      unsent.forEach(msg => {
        socket.emit('sendMessage', msg);
      });

      localStorage.removeItem(UNSENT_MESSAGES_KEY);
    }
  }
}, [isConnected, socket, user]);


  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

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
    onlineUsers,
    fetchUsers,
    selectUser,
    sendMessage,
    sendTyping,
    searchMessages,
    clearError,
    socket,
    isConnected,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};