// src/components/Chat/MessageList.jsx
import useAutoScroll from '../../hooks/useAutoScroll';
import { useChat } from '../../context/ChatContext';
import Message from './Message';

export default function MessageList() {
  const { messages } = useChat();
  const messagesEndRef = useAutoScroll([messages]);

  return (
    <div className=" md:p-4 h-min-screen p-2 max-w-3xl  mx-auto space-y-2">
      {messages.length > 0 ? (
        messages.map((message) => (
          <Message key={message._id} message={message} />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No messages yet</h3>
          <p className="mt-1 text-sm text-gray-500">Send your first message to start the conversation</p>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}