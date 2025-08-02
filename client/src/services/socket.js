import { io } from 'socket.io-client';
import { useEffect, useState, useCallback } from 'react';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  const connectSocket = useCallback((userId) => {
    try {
      if (!userId) {
        console.log('No userId provided, cannot connect socket');
        setConnectionError('No user ID provided');
        return null;
      }

      console.log('Connecting socket for user:', userId);

      const socketInstance = io(SOCKET_URL, {
        auth: { userId },
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        randomizationFactor: 0.5,
        timeout: 20000,
        transports: ['websocket', 'polling']
      });

      // Connection events
      socketInstance.on('connect', () => {
        setConnectionStatus('connected');
        console.log('🔌 Socket connected successfully for user:', userId);
        setIsConnected(true);
        setConnectionError(null);
        
        // Join user's room and set online status
        socketInstance.emit('join', userId);
        socketInstance.emit('userOnline', userId);
      });

      socketInstance.on('disconnect', (reason) => {
        setConnectionStatus(reason === 'io server disconnect' ? 'disconnected' : 'reconnecting');
        console.log('🔌 Socket disconnected:', reason);
        setIsConnected(false);
      });

      socketInstance.on('connect_error', (err) => {
        console.error('❌ Socket connection error:', err);
        setConnectionError(err.message);
        setIsConnected(false);
        setConnectionStatus('error');
      });

      socketInstance.on('reconnect_failed', () => {
        console.error('❌ Socket reconnection failed');
        setConnectionError('Failed to reconnect');
        setIsConnected(false);
        setConnectionStatus('failed');
      });

      socketInstance.on('reconnect', (attemptNumber) => {
        console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
        setConnectionStatus('connected');
        setIsConnected(true);
        setConnectionError(null);
        
        // Re-join user's room after reconnection
        socketInstance.emit('join', userId);
        socketInstance.emit('userOnline', userId);
      });

      socketInstance.on('reconnecting', (attemptNumber) => {
        console.log('🔄 Attempting to reconnect...', attemptNumber);
        setConnectionStatus('reconnecting');
      });

      return socketInstance;
    } catch (error) {
      console.error('❌ Error creating socket connection:', error);
      setConnectionError('Failed to create connection');
      return null;
    }
  }, []);

  // Initialize socket connection
  useEffect(() => {
    let socketInstance = null;
    
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.userId) {
      console.log('Initializing socket connection for user:', user.userId);
      socketInstance = connectSocket(user.userId);
      if (socketInstance) {
        setSocket(socketInstance);
      }
    } else {
      console.log('No user found, skipping socket connection');
    }

    return () => {
      if (socketInstance) {
        console.log('Cleaning up socket connection');
        socketInstance.off('connect');
        socketInstance.off('disconnect');
        socketInstance.off('connect_error');
        socketInstance.off('reconnect_failed');
        socketInstance.off('reconnect');
        socketInstance.off('reconnecting');
        socketInstance.disconnect();
      }
    };
  }, [connectSocket]);

  // Function to manually connect socket (for use after login)
  const connect = useCallback((userId) => {
    console.log('Manual connect requested for user:', userId);
    
    // Disconnect existing socket if any
    if (socket) {
      console.log('Disconnecting existing socket...');
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
    
    // Create new socket connection
    const newSocket = connectSocket(userId);
    if (newSocket) {
      setSocket(newSocket);
    }
  }, [socket, connectSocket]);

  const retryConnection = useCallback(() => {
    console.log('Retrying socket connection...');
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.userId) {
      connect(user.userId);
    }
  }, [connect]);

  const disconnect = useCallback(() => {
    console.log('Disconnecting socket...');
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setConnectionStatus('disconnected');
    }
  }, [socket]);

  return { 
    socket,
    isConnected,
    connectionError,
    connectionStatus,
    connect,
    retryConnection,
    disconnect
  };
};