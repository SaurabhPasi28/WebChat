import { useEffect, useRef, useState, useCallback } from 'react';

export function useWebSocket(token, onMessage) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef(null);

  const connect = useCallback(() => {
    if (!token) return;

    // Clear any existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Clear any pending reconnection
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
    }

    const wsUrl = `ws://localhost:3001?token=${token}`;
    console.log('Connecting to WebSocket:', wsUrl);
    
    const ws = new WebSocket(wsUrl);

    // Heartbeat to keep connection alive
    let heartbeatInterval;
    const heartbeat = () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }));
      }
    };

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      reconnectAttempts.current = 0;
      
      // Start heartbeat
      heartbeatInterval = setInterval(heartbeat, 25000);
    };

    ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      setIsConnected(false);
      clearInterval(heartbeatInterval);
      
      // Exponential backoff reconnect
      if (event.code !== 1000) { // Don't reconnect if normal closure
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        reconnectTimer.current = setTimeout(() => {
          reconnectAttempts.current += 1;
          connect();
        }, delay);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'pong') return; // Ignore pong messages
        
        if (onMessage) onMessage(message);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    wsRef.current = ws;

    return () => {
      clearInterval(heartbeatInterval);
      if ([WebSocket.OPEN, WebSocket.CONNECTING].includes(ws.readyState)) {
        ws.close(1000, 'Component unmounted');
      }
    };
  }, [token, onMessage]);

  useEffect(() => {
    const cleanup = connect();
    return () => {
      cleanup?.();
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    console.warn('Cannot send message - WebSocket not connected');
    return false;
  }, []);

  return { sendMessage, isConnected };
}