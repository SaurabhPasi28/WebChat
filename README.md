# WebChat - Real-time Chat Application

A modern, real-time chat application built with React, Node.js, Socket.IO, and MongoDB. Features a clean, responsive design with real-time messaging capabilities.

## Features

### Core Messaging
- **Real-time messaging** with instant message delivery
- **Message status tracking** (sent, delivered, read)
- **Typing indicators** to show when users are typing
- **Online/offline status** with last seen timestamps
- **Message timestamps** with readable time formatting

### User Management
- **User authentication** with JWT tokens
- **User profiles** with avatars and status
- **User search** functionality
- **Online status tracking** across all connected clients

### Chat Interface
- **Responsive design** that works on mobile and desktop
- **Message bubbles** with different styles for sent/received messages
- **Unread message counts** for each conversation
- **Message search** within conversations
- **Auto-scroll** to latest messages
- **Clean, modern UI** with smooth animations

### Real-time Features
- **WebSocket connections** for instant updates
- **Typing indicators** in real-time
- **Online status updates** across all clients
- **Message read receipts** with status updates
- **Connection status** indicators

## Tech Stack

### Frontend
- **React 18** with modern hooks
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Socket.IO Client** for real-time communication
- **Axios** for HTTP requests
- **Heroicons** for icons

### Backend
- **Node.js** with Express.js
- **Socket.IO** for real-time communication
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing

### Database
- **MongoDB** for data persistence
- **Mongoose** for schema management and validation

## Project Structure

```
WebChat/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Auth/     # Authentication components
│   │   │   ├── Chat/     # Chat interface components
│   │   │   └── Layout/   # Layout components
│   │   ├── context/      # React context providers
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Page components
│   │   └── services/     # API and socket services
│   └── public/           # Static assets
├── server/               # Node.js backend
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Express middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   └── utils/           # Utility functions
└── setup.js             # Database setup script
```

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd WebChat
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Configuration**
   
   Create `server/config.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/webchat
   JWT_SECRET=your_jwt_secret_here
   NODE_ENV=development
   ```

4. **Database Setup**
   ```bash
   cd server
   node setup.js
   ```

5. **Start the application**
   ```bash
   # Start server (from server directory)
   npm start

   # Start client (from client directory)
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Chat
- `GET /api/chat/users` - Get all users
- `GET /api/chat/messages/:receiverId` - Get messages with a user
- `GET /api/chat/users/status/:userId` - Get user status

## Socket Events

### Client to Server
- `join` - Join user room
- `userOnline` - Mark user as online
- `userOffline` - Mark user as offline
- `sendMessage` - Send a new message
- `typing` - Start typing indicator
- `stopTyping` - Stop typing indicator
- `markAsRead` - Mark messages as read

### Server to Client
- `receiveMessage` - Receive new message
- `messageSent` - Confirm message sent
- `typing` - User started typing
- `stopTyping` - User stopped typing
- `userStatusChanged` - User online/offline status
- `messagesRead` - Messages marked as read

## Features Removed

The following features have been removed to simplify the application:

- **Message editing** - Users can no longer edit sent messages
- **Message deletion** - Users can no longer delete messages
- **Message reactions** - Users can no longer add emoji reactions to messages
- **Message search** - Server-side message search has been removed (client-side search within conversations remains)
- **Conversation deletion** - Users can no longer delete entire conversations
- **Message attachments** - File upload functionality has been removed
- **Message replies** - Reply-to-message functionality has been removed

## Development

### Running in Development
```bash
# Server (from server directory)
npm run dev

# Client (from client directory)
npm run dev
```

### Building for Production
```bash
# Client (from client directory)
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository. 