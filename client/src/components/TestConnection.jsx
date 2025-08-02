import { useSocket } from '../services/socket.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function TestConnection() {
  const { socket, isConnected, connectionStatus, connectionError, connect } = useSocket();
  const { user } = useAuth();

  const handleTestConnection = () => {
    if (user?.userId) {
      console.log('🧪 Testing connection for user:', user.userId);
      connect(user.userId);
    }
  };

  return (
    <div className="p-4 bg-gray-100 dark:bg-dark-surface rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Socket Connection Test</h3>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Status:</span>
          <span className={`px-2 py-1 rounded text-xs ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {connectionStatus}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Connected:</span>
          <span className={`px-2 py-1 rounded text-xs ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isConnected ? 'Yes' : 'No'}
          </span>
        </div>
        
        {connectionError && (
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Error:</span>
            <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">
              {connectionError}
            </span>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">User:</span>
          <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
            {user?.username || 'Not logged in'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Socket ID:</span>
          <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
            {socket?.id || 'No socket'}
          </span>
        </div>
      </div>
      
      <div className="space-x-2">
        <button
          onClick={handleTestConnection}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Connection
        </button>
        
        <button
          onClick={() => {
            if (socket) {
              socket.emit('userOnline', user?.userId);
              console.log('🧪 Emitted userOnline event');
            }
          }}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          disabled={!isConnected}
        >
          Emit userOnline
        </button>
      </div>
    </div>
  );
}