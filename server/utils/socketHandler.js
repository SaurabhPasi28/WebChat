
import { Server } from 'socket.io';
import User from '../models/User.js';
import Message from '../models/Message.js';

// Store typing timeouts
const typingTimeouts = {};

export const configureSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);
    
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

    // Message status updates
    socket.on('messageStatus', async ({ messageId, status, userId }) => {
      try {
        const message = await Message.findByIdAndUpdate(
          messageId,
          { status },
          { new: true }
        ).populate('sender receiver');
        
        if (status === 'read') {
          io.to(userId).emit('messageRead', message);
        } else {
          io.to(message.receiver._id).emit('messageStatusUpdate', message);
        }
        
        console.log(`📊 Message ${messageId} status updated to ${status}`);
      } catch (error) {
        console.error('Error updating message status:', error);
      }
    });

    // Disconnect handling
    socket.on('disconnect', async () => {
      console.log('🔌 Client disconnected:', socket.id);
      
      // Find user by socket ID and mark as offline
      try {
        const user = await User.findOneAndUpdate(
          { socketId: socket.id },
          { 
            isOnline: false,
            lastSeen: new Date()
          }
        );
        
        if (user) {
          io.emit('userStatusChanged', { userId: user._id, isOnline: false });
          console.log(`🔴 User ${user._id} disconnected`);
        }
      } catch (error) {
        console.error('Error handling disconnect:', error);
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