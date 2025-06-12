import { useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

export default function TestConnection({ token }) {
  const { isConnected } = useWebSocket(token, (message) => {
    console.log('WebSocket message:', message);
  });

  return (
    <div className="fixed bottom-4 right-4 bg-white p-2 rounded shadow">
      WebSocket: {isConnected ? (
        <span className="text-green-500">Connected</span>
      ) : (
        <span className="text-red-500">Disconnected</span>
      )}
    </div>
  );
}