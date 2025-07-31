# WebChat - Real-time Chat Application

A modern real-time chat application built with React, Node.js, Socket.IO, and MongoDB.

## Features

- 🔐 User authentication (signup/login)
- 💬 Real-time messaging
- 👥 User list with online status
- 📱 Responsive design
- 🔄 Message status (sent, delivered, read)
- 🎨 Modern UI with Tailwind CSS
- 🔒 JWT authentication
- 🚀 Socket.IO for real-time communication

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (running on localhost:27017)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd WebChat
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Set up environment variables**
   
   The setup script will create the necessary environment files:
   ```bash
   node setup.js
   ```
   
   Or manually create:
   
   **server/.env:**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/webchat
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-change-this-in-production
   CLIENT_URL=http://localhost:5173
   USE_REDIS=false
   ```
   
   **client/.env:**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on localhost:27017

## Running the Application

### Development Mode

1. **Start the server**
   ```bash
   cd server
   npm start
   ```
   Server will run on http://localhost:5000

2. **Start the client**
   ```bash
   cd client
   npm run dev
   ```
   Client will run on http://localhost:5173

### Production Mode

1. **Build the client**
   ```bash
   cd client
   npm run build
   ```

2. **Start the server**
   ```bash
   cd server
   NODE_ENV=production npm start
   ```

## Project Structure

```
WebChat/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React context providers
│   │   ├── services/       # API and socket services
│   │   └── ...
│   └── ...
├── server/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   ├── utils/             # Utility functions
│   └── ...
└── ...
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Chat
- `GET /api/chat/users` - Get all users
- `GET /api/chat/messages/:receiverId` - Get messages with a user

## Socket Events

### Client to Server
- `join` - Join user room
- `sendMessage` - Send a message
- `typing` - User typing indicator
- `stopTyping` - Stop typing indicator
- `markAsRead` - Mark messages as read

### Server to Client
- `receiveMessage` - Receive new message
- `typing` - User typing notification
- `stopTyping` - User stopped typing
- `userStatusChanged` - User online/offline status

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running on localhost:27017
   - Check if the database name is correct in MONGODB_URI

2. **Socket Connection Issues**
   - Verify the server is running on port 5000
   - Check CORS configuration in server
   - Ensure client is connecting to the correct socket URL

3. **Authentication Issues**
   - Check JWT_SECRET is set in environment variables
   - Verify token expiration settings
   - Clear browser localStorage if needed

4. **User Registration/Login Issues**
   - Check if MongoDB is accessible
   - Verify password requirements (minimum 6 characters)
   - Check for duplicate usernames

### Debug Mode

To enable debug logging, set `NODE_ENV=development` in your server environment.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues, please:
1. Check the troubleshooting section
2. Review the console logs for errors
3. Ensure all dependencies are installed
4. Verify environment variables are set correctly 