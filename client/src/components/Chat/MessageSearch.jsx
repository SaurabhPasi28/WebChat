import { useState } from 'react';
import { useChat } from '../../context/ChatContext.jsx';

export default function MessageSearch() {
  const { searchMessages, searchResults } = useChat();
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    searchMessages(query);
  };

  return (
    <div className="relative">
      <form onSubmit={handleSearch} className="p-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search messages..."
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </form>
      
      {searchResults.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {searchResults.map(msg => (
            <div key={msg._id} className="p-3 border-b border-gray-100 hover:bg-gray-50">
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(msg.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}