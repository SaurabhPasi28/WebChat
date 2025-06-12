// export default function UserProfile({ user }) {
//   return (
//     <div className="p-4 border-b border-gray-200 bg-white flex items-center space-x-3">
//       <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
//         <span className="text-indigo-600 font-medium">
//           {user.username.charAt(0).toUpperCase()}
//         </span>
//       </div>
//       <div>
//         <h2 className="text-lg font-semibold text-gray-800">{user.username}</h2>
//         {user.isOnline && <p className="text-xs font-semibold text-green-500">Online</p>}
//       </div>
//     </div>
//   );
// }


// src/components/Chat/UserProfile.jsx
import { useChat } from '../../context/ChatContext';
import { EllipsisHorizontalIcon, PhoneIcon, VideoCameraIcon } from '@heroicons/react/24/outline';

export default function UserProfile() {
  const { selectedUser } = useChat();

  if (!selectedUser) return null;

  return (
    <div className="flex items-center justify-between p-1  md:p-3">
      <div className="flex items-center">
        <div className="relative mr-3">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-sm">
            <span className="text-indigo-600 font-medium md:text-xl">
              {selectedUser.username.charAt(0).toUpperCase()}
            </span>
          </div>
          {selectedUser.isOnline && (
            <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        <div>
          <h2 className="font-semibold text-xs md:text-xl text-gray-900">{selectedUser.username}</h2>
          <p className="text-xs text-gray-500">
            {selectedUser.isOnline ? 'Online now' : 'Offline'}
          </p>
        </div>
      </div>
      {/* <div className="flex space-x-2">
        <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
          <PhoneIcon className="h-5 w-5" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
          <VideoCameraIcon className="h-5 w-5" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
          <EllipsisHorizontalIcon className="h-5 w-5" />
        </button>
      </div> */}
    </div>
  );
}