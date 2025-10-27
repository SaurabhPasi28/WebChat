import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../services/socket.js';
import { chatAPI } from '../services/api.js';
import { useAuth } from './AuthContext.jsx';
import notificationService from '../utils/notifications.js';
import toast from 'react-hot-toast';

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
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📨 NEW MESSAGE RECEIVED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const messageSenderId = message.sender?._id || message.sender;
    const messageReceiverId = message.receiver?._id || message.receiver;
    const senderUsername = message.sender?.username || 'Someone';
    
    console.log('👤 From:', senderUsername);
    console.log('📝 Content:', message.content.substring(0, 50));
    console.log('🆔 Sender ID:', messageSenderId);
    console.log('🆔 Your ID:', user.userId);
    
    // Skip if message is from current user
    if (messageSenderId === user.userId) {
      console.log('⏭️ Skipping - message is from current user');
      return;
    }
    
    // Check if tab is currently visible/focused
    const isTabVisible = !document.hidden;
    const isWindowFocused = document.hasFocus();
    console.log('🔍 Tab visible:', isTabVisible);
    console.log('🔍 Document hidden:', document.hidden);
    console.log('🔍 Window focused:', isWindowFocused);
    
    // Determine if this message is for current chat
    let isPartOfCurrentChat = false;
    if (selectedUser) {
      isPartOfCurrentChat = 
        (messageSenderId === selectedUser._id && messageReceiverId === user.userId) ||
        (messageSenderId === user.userId && messageReceiverId === selectedUser._id);
    }
    
    console.log('💬 Selected user:', selectedUser?.username || 'None');
    console.log('🎯 Part of current chat:', isPartOfCurrentChat);
    
    // Add message to UI if it's part of current conversation
    if (selectedUser && isPartOfCurrentChat) {
      console.log('✅ Adding message to current chat UI');
      setMessages(prev => {
        // Replace temp message if exists
        const filtered = prev.filter(m => !m.isTemp || m._id !== message._id);
        return [...filtered, message];
      });
    }
    
    // ENHANCED NOTIFICATION LOGIC
    // Always show notification if ANY of these conditions:
    const shouldShowNotification = 
      !isTabVisible ||           // Tab not visible
      !isWindowFocused ||        // Window not focused
      !selectedUser ||           // No chat selected
      !isPartOfCurrentChat;      // Different chat
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔔 NOTIFICATION DECISION');
    console.log('Should show:', shouldShowNotification);
    console.log('Reason:', {
      tabNotVisible: !isTabVisible,
      windowNotFocused: !isWindowFocused,
      noUserSelected: !selectedUser,
      differentChat: !isPartOfCurrentChat
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (shouldShowNotification) {
      console.log('� TRIGGERING NOTIFICATION NOW!');
      
      // Use force show for maximum reliability
      notificationService.forceShowNotification({
        username: senderUsername,
        message: message.content,
        onClick: () => {
          console.log('🖱️ Notification clicked, focusing window');
          window.focus();
          // Switch to the sender's chat when clicking notification
          const sender = users.find(u => u._id === messageSenderId);
          if (sender) {
            setSelectedUser(sender);
          }
        }
      });
    }
    
    // Show in-app toast only if tab is visible
    if (isTabVisible && isWindowFocused) {
      if (isPartOfCurrentChat) {
        // Current chat - show message preview
        toast.success(`${senderUsername}: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`, {
          duration: 3000,
          position: 'top-right'
        });
      } else {
        // Different chat - show notification
        toast(`💬 New message from ${senderUsername}`, {
          duration: 4000,
          position: 'top-right',
        });
      }
    }

    // Update unread count if not current chat
    if (selectedUser?._id !== messageSenderId) {
      setUnreadCounts(prev => ({
        ...prev,
        [messageSenderId]: (prev[messageSenderId] || 0) + 1
      }));
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }, [selectedUser, user?.userId, users]);

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

  // Handle message sent confirmation from server
  const handleMessageSent = useCallback((message) => {
    console.log('✅ Message sent confirmation received:', message._id);
    
    // Only update if this message belongs to the current conversation
    if (selectedUser) {
      const messageReceiverId = message.receiver?._id || message.receiver;
      
      if (messageReceiverId === selectedUser._id) {
        console.log('✅ Message belongs to current chat, replacing temp message');
        setMessages(prev => 
          prev.map(msg => {
            // Replace temp message with real message from server
            if (msg.isTemp && msg.content === message.content) {
              return { ...message, isTemp: false };
            }
            return msg;
          })
        );
      } else {
        console.log('⏭️ Message sent confirmation not for current chat, ignoring');
      }
    }
  }, [selectedUser]);

  // Handle message delivered confirmation
  const handleMessageDelivered = useCallback(({ messageId, status }) => {
    console.log('📨 Message delivered confirmation:', messageId);
    setMessages(prev => 
      prev.map(msg => 
        msg._id === messageId ? { ...msg, status: 'delivered' } : msg
      )
    );
    
    // Show toast notification
    toast.success('Message delivered ✓✓', {
      duration: 2000,
      position: 'bottom-right'
    });
  }, []);

  // Handle messages seen/read by receiver
  const handleMessagesSeen = useCallback(({ readerId, status }) => {
    console.log('👁️ Messages seen by:', readerId, '- Updating messages in current view');
    
    let updatedCount = 0;
    setMessages(prev => 
      prev.map(msg => {
        // Update MY messages that were sent TO the reader (readerId)
        // msg.sender._id is ME (current user)
        // msg.receiver._id or msg.receiver is the person who read it (readerId)
        const msgReceiverId = msg.receiver?._id || msg.receiver;
        if (msgReceiverId === readerId && msg.status !== 'read') {
          console.log('✓ Updating message', msg._id, 'to read status');
          updatedCount++;
          return { ...msg, status: 'read' };
        }
        return msg;
      })
    );
    
    // Show notification if messages were updated
    if (updatedCount > 0) {
      const readerUser = users.find(u => u._id === readerId);
      const readerName = readerUser?.username || 'User';
      
      toast.success(`${readerName} has seen your message${updatedCount > 1 ? 's' : ''} 👁️`, {
        duration: 3000,
        position: 'bottom-right'
      });
      
      // Optional: Browser notification (silent)
      notificationService.showMessageSeen(readerName, updatedCount);
    }
  }, [users]);

  // Setup socket listeners
  const setupSocketListeners = useCallback(() => {
    if (!socket) {
      console.log('❌ No socket available for setting up listeners');
      return;
    }
    
    console.log('🔧 Setting up socket listeners...');
    
    // Remove existing listeners to prevent duplicates
    socket.off('receiveMessage');
    socket.off('messageSent');
    socket.off('messageDelivered');
    socket.off('messagesSeen');
    socket.off('typing');
    socket.off('stopTyping');
    socket.off('userStatusChanged');
    socket.off('messagesRead');
    
    // Message handling - ORDER MATTERS!
    socket.on('messageSent', handleMessageSent);
    socket.on('messageDelivered', handleMessageDelivered);
    socket.on('receiveMessage', handleNewMessage);
    socket.on('messagesSeen', handleMessagesSeen);
    socket.on('messageRemoved', (messageId) => {
      console.log('🗑️ Message removed:', messageId);
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    });
    
    // Typing indicators
    socket.on('typing', handleTyping);
    socket.on('stopTyping', handleStopTyping);
    
    // User status changes
    socket.on('userStatusChanged', handleUserStatusChange);
    
    // Legacy support
    socket.on('messagesRead', handleMessagesRead);
    
    console.log('✅ Socket listeners set up successfully');
  }, [socket, handleMessageSent, handleMessageDelivered, handleNewMessage, handleMessagesSeen, handleTyping, handleStopTyping, handleUserStatusChange, handleMessagesRead]);

  // Initialize chat when user is authenticated
  useEffect(() => {
    if (user) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('👤 USER AUTHENTICATED - INITIALIZING');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      fetchUsers();
      
      // Request notification permission with delay to ensure page is fully loaded
      setTimeout(() => {
        console.log('🔔 Requesting notification permission...');
        notificationService.requestPermission().then(permission => {
          console.log('🔔 Permission result:', permission);
          if (permission === 'granted') {
            console.log('✅ NOTIFICATION PERMISSION GRANTED!');
            toast.success('🔔 Browser notifications enabled!', { 
              duration: 3000,
              style: {
                background: '#10b981',
                color: 'white',
              }
            });
            
            // Test notification
            setTimeout(() => {
              console.log('🧪 Sending test notification...');
              notificationService.show('WebChat Ready!', {
                body: 'You will receive notifications for new messages',
                tag: 'test-notification'
              });
            }, 1000);
          } else if (permission === 'denied') {
            console.error('❌ NOTIFICATION PERMISSION DENIED!');
            toast.error('⚠️ Notifications blocked! Click the 🔒 icon in address bar to enable', { 
              duration: 6000,
              style: {
                background: '#ef4444',
                color: 'white',
              }
            });
          } else {
            console.warn('⚠️ Notification permission not granted yet');
            toast('Click "Allow" when asked for notifications', { 
              duration: 4000,
              icon: '🔔'
            });
          }
        }).catch(error => {
          console.error('❌ Error requesting permission:', error);
        });
      }, 1000);
    }
  }, [user, fetchUsers]);

  // Listen for page visibility changes for debugging
  useEffect(() => {
    const handleVisibilityChange = () => {
      console.log(`👁️ Page visibility changed - Hidden: ${document.hidden}`);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

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
        socket.off('messageSent');
        socket.off('messageDelivered');
        socket.off('messagesSeen');
        socket.off('typing');
        socket.off('stopTyping');
        socket.off('userStatusChanged');
        socket.off('messagesRead');
      }
      clearTimeout(typingTimeout.current);
      clearTimeout(messageStatusTimeout.current);
    };
  }, [socket]);

  // Mark messages as read when viewing a conversation
  useEffect(() => {
    if (selectedUser && socket && isConnected && messages.length > 0) {
      // Find unread messages from the selected user
      const unreadMessages = messages.filter(msg => {
        const msgSenderId = msg.sender?._id || msg.sender;
        return msgSenderId === selectedUser._id && msg.status !== 'read';
      });

      if (unreadMessages.length > 0) {
        console.log(`📖 Auto-marking ${unreadMessages.length} messages as read from ${selectedUser.username}`);
        
        // Update UI immediately
        setMessages(prev => 
          prev.map(msg => {
            const msgSenderId = msg.sender?._id || msg.sender;
            if (msgSenderId === selectedUser._id && msg.status !== 'read') {
              return { ...msg, status: 'read' };
            }
            return msg;
          })
        );

        // Notify server and sender
        socket.emit('markAsRead', {
          senderId: selectedUser._id,
          receiverId: user.userId
        });
      }
    }
  }, [selectedUser, messages.length, socket, isConnected, user?.userId]);

  // Fetch messages for selected user
  const fetchMessages = async (receiverId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await chatAPI.getMessages(receiverId);
      setMessages(data);
      
      // Mark messages as read - this notifies the SENDER via socket
      if (data.length > 0 && socket && isConnected) {
        console.log('📖 Marking messages as read from:', receiverId);
        
        // Immediately update UI on receiver's side
        setMessages(prev => 
          prev.map(msg => {
            // Mark messages FROM the selected user as read
            const msgSenderId = msg.sender?._id || msg.sender;
            if (msgSenderId === receiverId && msg.status !== 'read') {
              console.log('✓ Marking message', msg._id, 'as read locally');
              return { ...msg, status: 'read' };
            }
            return msg;
          })
        );
        
        // Emit to server to notify sender
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
  const selectUser = useCallback((selectedUserObj) => {
    console.log('👤 Selecting user:', selectedUserObj.username);
    setSelectedUser(selectedUserObj);
    fetchMessages(selectedUserObj._id);
  }, [user?.userId, socket, isConnected]);

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

    // Create temporary message with unique ID
    const tempMessage = {
      _id: `temp_${Date.now()}_${Math.random()}`,
      sender: { _id: user.userId, username: user.username },
      receiver: { _id: selectedUser._id, username: selectedUser.username },
      content,
      createdAt: payload.createdAt,
      isTemp: true,
      status: 'sent'
    };

    // Add temp message to UI immediately
    setMessages(prev => [...prev, tempMessage]);

    // Send to server - server will handle status updates via socket events
    socket.emit('sendMessage', payload);
    
    // DON'T set timeout - let socket events handle status updates!
    console.log('📤 Message sent to server, waiting for confirmation...');
    
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

  // Delete message
  const deleteMessage = useCallback(async (messageId) => {
    try {
      console.log('🗑️ Deleting message:', messageId);
      
      // Make API call to delete
      await chatAPI.deleteMessage(messageId);
      
      // Remove from local state immediately
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      
      // Emit socket event to notify other user
      if (socket && isConnected && selectedUser) {
        socket.emit('messageDeleted', {
          messageId,
          senderId: user.userId,
          receiverId: selectedUser._id
        });
      }
      
      toast.success('Message deleted');
    } catch (error) {
      console.error('❌ Failed to delete message:', error);
      toast.error('Failed to delete message');
    }
  }, [socket, isConnected, selectedUser, user]);

  // Context value
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
    deleteMessage,
    sendTyping,
    searchMessages,
    clearError,
    socket,
    isConnected,
    connect,
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