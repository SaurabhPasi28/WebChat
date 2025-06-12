// import { useState } from 'react';
// import { useChat } from '../../context/ChatContext.jsx';
// import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

// export default function ChatInput() {
//   const [message, setMessage] = useState('');
//   const { sendMessage, selectedUser } = useChat();

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (message.trim() && selectedUser) {
//       sendMessage(message);
//       setMessage('');
//     }
//   };

//   const handleTyping = () => {
//   if (!isTyping) {
//     socket.emit('startTyping', { 
//       chatId: selectedChat._id, 
//       userId: currentUser._id 
//     });
//     setIsTyping(true);
//   }

//   // Reset typing timeout
//   clearTimeout(typingTimeout.current);
//   typingTimeout.current = setTimeout(() => {
//     socket.emit('stopTyping', { 
//       chatId: selectedChat._id, 
//       userId: currentUser._id 
//     });
//     setIsTyping(false);
//   }, 3000);
// };
//   return (
//     <form onSubmit={handleSubmit} className="flex items-center space-x-2">
//       <input
//         type="text"
//         value={message}
//         onChange={(e) => setMessage(e.target.value)}
//         placeholder="Type your message..."
//         className="flex-1 border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
//       />
//       <button
//         type="submit"
//         disabled={!message.trim()}
//         className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
//       >
//         <PaperAirplaneIcon className="h-5 w-5 transform rotate-90" />
//       </button>
//     </form>
//   );
// }


// src/components/Chat/ChatInput.jsx
import { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { PaperAirplaneIcon, PaperClipIcon } from '@heroicons/react/24/solid';

export default function ChatInput() {
  const [message, setMessage] = useState('');
  const { sendMessage, selectedUser } = useChat();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && selectedUser) {
      sendMessage(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-1 md:p-3 bg-white">
      <div className="flex items-center space-x-2">
        <button type="button" className="p-2 text-gray-500 hover:text-indigo-600 transition-colors">
          <PaperClipIcon className="h-5 w-5" />
        </button>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message..."
          className="flex-1 border border-gray-300 rounded-full py-2 md:py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className={`p-2 rounded-full ${
            message.trim() 
              ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
              : 'text-gray-400'
          } transition-colors`}
        >
          <PaperAirplaneIcon className="h-5 w-5 transform rotate-0" />
        </button>
      </div>
    </form>
  );
}