import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    let socketInstance;
    
    const connectSocket = () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.userId) {
        setConnectionError('No user found');
        return;
      }

    const socketInstance = io(SOCKET_URL, {
      auth: { userId: user.userId },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      timeout: 20000,
      transports: ['websocket']
    });

      // Connection events
      socketInstance.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
        setConnectionError(null);
        socketInstance.emit('join', user.userId);
      });

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      socketInstance.on('connect_error', (err) => {
        console.error('Connection error:', err);
        setConnectionError(err.message);
        setIsConnected(false);
      });

      socketInstance.on('reconnect_failed', () => {
        console.error('Reconnection failed');
        setConnectionError('Failed to reconnect');
        setIsConnected(false);
      });

      socketInstance.on('reconnect', () => {
        setIsConnected(true);
        setConnectionError(null);
      });

      setSocket(socketInstance);
    };

    connectSocket();

    return () => {
      if (socketInstance) {
        socketInstance.off('connect');
        socketInstance.off('disconnect');
        socketInstance.off('connect_error');
        socketInstance.disconnect();
      }
    };
  }, []);

  return { 
    socket,
    isConnected,
    connectionError,
    retryConnection: () => {
      if (socket) {
        socket.connect();
      }
    }
  };
};