import { io } from 'socket.io-client';
import { useEffect, useState, useCallback } from 'react';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  const connectSocket = useCallback(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.userId) {
        setConnectionError('No user found');
        return null;
      }

      const socketInstance = io(SOCKET_URL, {
        auth: { userId: user.userId },
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
        console.log('🔌 Socket connected successfully');
        setIsConnected(true);
        setConnectionError(null);
        
        // Join user's room
        socketInstance.emit('join', user.userId);
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
        socketInstance.emit('join', user.userId);
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

  useEffect(() => {
    let socketInstance = null;
    
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.userId) {
      socketInstance = connectSocket();
      if (socketInstance) {
        setSocket(socketInstance);
      }
    }

    return () => {
      if (socketInstance) {
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

  const retryConnection = useCallback(() => {
    if (socket) {
      socket.connect();
    } else {
      const newSocket = connectSocket();
      if (newSocket) {
        setSocket(newSocket);
      }
    }
  }, [socket, connectSocket]);

  const disconnect = useCallback(() => {
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
    retryConnection,
    disconnect
  };
};