export default function TypingIndicator({ users, allUsers }) {
  const typingNames = users.map(userId => {
    const user = allUsers.find(u => u._id === userId);
    return user?.username || 'Someone';
  });

  if (typingNames.length === 0) return null;

  return (
    <div className="flex items-center px-4 py-2">
      <div className="flex space-x-1 px-3 py-2 bg-gray-100 rounded-full">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" 
               style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
      <span className="ml-2 text-sm text-gray-600">
        {typingNames.join(', ')} {typingNames.length > 1 ? 'are' : 'is'} typing...
      </span>
    </div>
  );
}