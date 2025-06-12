// import { useChat } from '../../context/ChatContext.jsx';
// import { formatDistanceToNow } from 'date-fns';
// import {
//   CheckIcon,
//   EllipsisHorizontalIcon // v2 replacement for DotsHorizontalIcon
// } from '@heroicons/react/24/solid';

// export default function ChatList() {
//   const { 
//     users, 
//     loading, 
//     error, 
//     selectUser, 
//     selectedUser, 
//     unreadCounts,
//     typingUsers
//   } = useChat();

//   if (error) {
//     return (
//       <div className="p-4 text-center">
//         <div className="text-red-500 text-sm">
//           Error loading conversations. 
//           <button 
//             onClick={() => window.location.reload()}
//             className="ml-1 text-indigo-600 hover:underline"
//           >
//             Try again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (loading) {
//     return (
//       <div className="p-4 space-y-3">
//         {[...Array(8)].map((_, i) => (
//           <div key={i} className="flex items-center space-x-3 animate-pulse">
//             <div className="h-10 w-10 rounded-full bg-gray-200"></div>
//             <div className="flex-1 space-y-2">
//               <div className="h-3 bg-gray-200 rounded w-3/4"></div>
//               <div className="h-2 bg-gray-200 rounded w-1/2"></div>
//             </div>
//           </div>
//         ))}
//       </div>
//     );
//   }

//   if (users.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center h-full p-6 text-center">
//         <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
//           </svg>
//         </div>
//         <h3 className="text-lg font-medium text-gray-900">No contacts found</h3>
//         <p className="mt-1 text-sm text-gray-500">Start by adding new contacts to your network</p>
//       </div>
//     );
//   }

//   return (
//     <div className="flex-1 overflow-y-auto">
//       <div className="px-3 py-2 sticky top-0 z-10 bg-white border-b border-gray-200">
//         <div className="relative">
//           <input
//             type="text"
//             placeholder="Search contacts..."
//             className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//           />
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//           </svg>
//         </div>
//       </div>

//       {users.map((user) => {
//         const isTyping = typingUsers.includes(user._id);
//         const unreadCount = unreadCounts[user._id] || 0;
//         const isSelected = selectedUser?._id === user._id;

//         return (
//           <div
//             key={user._id}
//             className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
//               isSelected ? 'bg-indigo-50' : ''
//             }`}
//             onClick={() => selectUser(user)}
//           >
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-3 min-w-0">
//                 <div className="relative">
//                   <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
//                     <span className="text-indigo-600 font-medium">
//                       {user.username.charAt(0).toUpperCase()}
//                     </span>
//                   </div>
//                   {user.isOnline && (
//                     <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
//                   )}
                  
//                 </div>
//                 <div className="min-w-0">
//                   <div className="flex items-center space-x-1">
//                     <p className="text-sm font-medium text-gray-800 truncate">
//                       {user.username}
//                     </p>
//                     {user.isVerified && (
//                       <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
//                         <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                       </svg>
//                     )}
//                   </div>
//                   <div className="flex items-center space-x-1">
//                     {isTyping ? (
//                       <span className="text-xs text-indigo-600">typing...</span>
//                     ) : (
//                       <p className="text-xs text-gray-500 truncate">
//                         {user.lastMessage?.content || 'No messages yet'}
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//               <div className="flex flex-col items-end space-y-1">
//                 <span className="text-xs text-gray-400">
//                   {user.lastSeen && formatDistanceToNow(new Date(user.lastSeen), { addSuffix: true })}
//                 </span>
//                 {unreadCount > 0 && (
//                   <span className="bg-indigo-600 text-white text-xs font-medium h-5 w-5 flex items-center justify-center rounded-full">
//                     {unreadCount}
//                   </span>
//                 )}
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// src/components/Chat/ChatList.jsx
import { useChat } from '../../context/ChatContext';
// import { formatDistanceToNow } from 'date-fns';

export default function ChatList({ onSelectUser }) {
  const { users, loading, error, selectUser } = useChat();

  const handleSelect = (user) => {
    selectUser(user);
    if (onSelectUser) onSelectUser();
  };

  if (loading) {
    return (
      <div className="p-4 h-full border-b-4 border-red-600 space-y-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3 animate-pulse">
            <div className="h-12 w-12 rounded-full bg-gray-200"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 text-sm">
          Failed to load conversations. 
          <button 
            onClick={() => window.location.reload()}
            className="ml-1 text-indigo-600 hover:underline"
          >
            Try again
          </button>
        </p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] p-6 text-center">
        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">No contacts yet</h3>
        <p className="mt-1 text-sm text-gray-500">Add people to start chatting</p>
        <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors">
          Add Contacts
        </button>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {users.map((user) => (
        <div
          key={user._id}
          className="p-4 flex items-center hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
          onClick={() => handleSelect(user)}
        >
          <div className="relative mr-3">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-sm">
              <span className="text-indigo-600 font-medium text-xl">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            {user.isOnline && (
              <div className="absolute bottom-1 right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline">
              <h3 className="font-medium text-gray-900 truncate">{user.username}</h3>
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {/* {formatDistanceToNow(new Date(user.lastSeen), { addSuffix: true })} */}
              </span>
            </div>
            <p className="text-sm text-gray-500 truncate mt-1">
              {user.lastMessage?.content || 'Tap to start chatting'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}