
import { Server } from 'socket.io';
import User from '../models/User.js';
import Message from '../models/Message.js';

// Store typing timeouts
const typingTimeouts = {};

export const configureSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);
    
    // Get userId from auth or handshake
    const userId = socket.handshake.auth?.userId;
    
    if (!userId) {
      console.log('❌ Socket connection rejected: No userId provided');
      socket.disconnect();
      return;
    }

    // Attach user info to socket
    socket.userId = userId;
    console.log('✅ Socket connected for user:', userId);
    
    // Join a room based on user ID
    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`👤 User ${userId} joined their room`);
    });

    // User comes online
    socket.on('userOnline', async (userId) => {
      try {
        await User.findByIdAndUpdate(userId, { 
          isOnline: true,
          socketId: socket.id
        });
        io.emit('userStatusChanged', { userId, isOnline: true });
        console.log(`🟢 User ${userId} is now online`);
      } catch (error) {
        console.error('Error updating user online status:', error);
      }
    });

    // User goes offline
    socket.on('userOffline', async (userId) => {
      try {
        await User.findByIdAndUpdate(userId, { 
          isOnline: false,
          lastSeen: new Date()
        });
        io.emit('userStatusChanged', { userId, isOnline: false });
        console.log(`🔴 User ${userId} is now offline`);
      } catch (error) {
        console.error('Error updating user offline status:', error);
      }
    });

    // Send message
    socket.on('sendMessage', async ({ senderId, receiverId, content }) => {
      try {
        const message = new Message({
          sender: senderId,
          receiver: receiverId,
          content,
          status: 'sent'
        });
        
        await message.save();
        await message.populate('sender receiver', 'username avatar status');
        
        // Send to receiver
        io.to(receiverId).emit('receiveMessage', message);
        
        // Send back to sender for confirmation
        socket.emit('messageSent', message);
        
        console.log(`💬 Message sent from ${senderId} to ${receiverId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('messageError', { error: 'Failed to send message' });
      }
    });

    // Typing indicators
    socket.on('typing', (receiverId) => {
      socket.to(receiverId).emit('typing', socket.userId);
    });

    socket.on('stopTyping', (receiverId) => {
      socket.to(receiverId).emit('stopTyping', socket.userId);
    });

    // Mark messages as read
    socket.on('markAsRead', async ({ senderId, receiverId }) => {
      try {
        await Message.updateMany(
          {
            sender: senderId,
            receiver: receiverId,
            status: { $ne: 'read' }
          },
          { $set: { status: 'read' } }
        );
        
        // Notify sender that messages were read
        io.to(senderId).emit('messagesRead', { readerId: receiverId });
        
        console.log(`👁️ Messages marked as read by ${receiverId}`);
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log('🔌 Client disconnected:', socket.id, 'for user:', socket.userId);
      
      if (socket.userId) {
        try {
          await User.findByIdAndUpdate(socket.userId, { 
            isOnline: false,
            lastSeen: new Date()
          });
          io.emit('userStatusChanged', { userId: socket.userId, isOnline: false });
          console.log(`🔴 User ${socket.userId} went offline due to disconnect`);
        } catch (error) {
          console.error('Error updating user offline status on disconnect:', error);
        }
      }
    });
  });
};

// Helper function to clear typing timeout
function clearTypingTimeout(userId) {
  if (typingTimeouts[userId]) {
    clearTimeout(typingTimeouts[userId]);
    delete typingTimeouts[userId];
  }
}

// Helper function to validate emoji
function isValidEmoji(emoji) {
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
  return emojiRegex.test(emoji);
}