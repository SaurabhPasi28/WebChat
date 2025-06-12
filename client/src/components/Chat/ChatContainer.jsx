// import useAutoScroll from '../../hooks/useAutoScroll';
// import { useChat } from '../../context/ChatContext.jsx';
// import ChatList from './ChatList.jsx';
// import ChatInput from './ChatInput.jsx';
// import Message from './Message.jsx';
// import UserProfile from './UserProfile.jsx';
// // import { useMediaQuery } from 'react-responsive';
// // import { useState } from 'react';

// export default function ChatContainer() {
//   const { users, messages, selectedUser, loading, error } = useChat();
//   // const isMobile = useMediaQuery({ maxWidth: 768 });
//   // const [showSidebar, setShowSidebar] = useState(!isMobile);
//   const messagesEndRef = useAutoScroll([messages]);


//   return (
//     <div className="flex h-[calc(100vh-80px)] bg-white rounded-xl shadow-lg overflow-hidden">
//       {/* Sidebar */}
//       <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col">
//         <div className="p-4 border-b border-gray-200 bg-white">
//           <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
//         </div>
//         <ChatList users={users} loading={loading} />
//       </div>
      
//       {/* Main chat area */}
//       <div className="flex-1 flex flex-col">
//         {selectedUser ? (
//           <>
//             <UserProfile user={selectedUser} />
            
//             <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white">
//               <div className="max-w-3xl mx-auto space-y-4">
//                 {messages.length > 0 ? (
//                    <>
//           {messages.map((message) => (
//             <Message key={message._id} message={message} />
//           ))}
//           {/* Empty div at the bottom for scrolling reference */}
//           <div ref={messagesEndRef} />
//         </>
//                 ) : (
//                   <div className="flex items-center justify-center h-full">
//                     <div className="text-center p-8">
//                       <div className="mx-auto h-12 w-12 text-gray-400">
//                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
//                         </svg>
//                       </div>
//                       <h3 className="mt-2 text-sm font-medium text-gray-900">No messages yet</h3>
//                       <p className="mt-1 text-sm text-gray-500">Start the conversation by sending a message</p>
//                     </div>
//                   </div>
//                 )}
//               </div >
//             </div>
            
//             <div className="p-4 border-t border-gray-200 bg-white">
//               <ChatInput />
//             </div>
//           </>
//         ) : (
//           <div className="flex-1 flex items-center justify-center bg-gray-50">
//             <div className="text-center p-8">
//               <div className="mx-auto h-16 w-16 text-gray-400">
//                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
//                 </svg>
//               </div>
//               <h3 className="mt-2 text-lg font-medium text-gray-900">Select a conversation</h3>
//               <p className="mt-1 text-sm text-gray-500">Choose from your contacts to start chatting</p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// src/components/Chat/ChatContainer.jsx
import { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import ChatList from './ChatList';
import ChatArea from './ChatArea.jsx';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function ChatContainer() {
  const { selectedUser } = useChat();
  const [isMobileListOpen, setIsMobileListOpen] = useState(true);

  return (
    <div className="flex w-full h-[calc(100vh-80px)] bg-gray-50">
      {/* Mobile Navigation Bar */}
      {/* <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-10"> */}
        {/* <div className="flex justify-around py-2">
          <button 
            onClick={() => setIsMobileListOpen(true)}
            className={`p-2 ${isMobileListOpen ? 'text-indigo-600' : 'text-gray-500'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </button>
          <button className="p-2 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
          <button className="p-2 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div> */}
      {/* </div> */}

      {/* Chat List View */}
      <div className={`${isMobileListOpen ? 'block' : 'hidden md:block'} w-full md:w-80 bg-white`}>
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">Messages</h1>
            <button className="p-1 text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>
        </div>
        <ChatList onSelectUser={() => setIsMobileListOpen(false)} />
      </div>

      {/* Chat Area View */}
      <div className={`${isMobileListOpen ? 'hidden md:block' : 'block'} flex-1 flex flex-col`}>
        {selectedUser ? (
          <ChatArea onBack={() => setIsMobileListOpen(true)} />
        ) : (
          <div className="hidden md:flex items-center justify-center h-full">
            <div className="text-center p-6 max-w-md">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Select a conversation</h2>
              <p className="text-gray-600 mt-2">Choose a contact to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}