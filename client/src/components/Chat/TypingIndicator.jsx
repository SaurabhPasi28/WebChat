export default function TypingIndicator({ user }) {
  return (
    <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg max-w-xs">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span className="text-sm text-gray-600">
        {user?.username || 'Someone'} is typing...
      </span>
    </div>
  );
}