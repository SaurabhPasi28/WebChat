
import { Server } from 'socket.io';
import User from '../models/User.js';  // Add this import
import Message from '../models/Message.js';  // Add this import


export const configureSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    // Join a room based on user ID
    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
    });
    

      // User comes online
    socket.on('userOnline', async (userId) => {
      await User.findByIdAndUpdate(userId, { 
        isOnline: true,
        socketId: socket.id
      });
      io.emit('userStatusChanged', { userId, isOnline: true });
    });

      // User goes offline
    socket.on('userOffline', async (userId) => {
      await User.findByIdAndUpdate(userId, { 
        isOnline: false,
        lastSeen: new Date()
      });
      io.emit('userStatusChanged', { userId, isOnline: false });
    });


      // Typing indicators
// Add these socket events
socket.on('startTyping', ({ chatId, userId }) => {
  socket.to(chatId).emit('userTyping', { userId });
  typingTimeouts[userId] = setTimeout(() => {
    socket.to(chatId).emit('stopTyping', { userId });
  }, 3000);
});

socket.on('stopTyping', ({ chatId, userId }) => {
  if (typingTimeouts[userId]) {
    clearTimeout(typingTimeouts[userId]);
    delete typingTimeouts[userId];
  }
  socket.to(chatId).emit('stopTyping', { userId });
});


      // Message reactions
    // socket.on('messageReaction', async ({ messageId, emoji, userId, chatId }) => {
    //   const message = await Message.addReaction(messageId, emoji, userId);
    //   io.to(chatId).emit('updateReactions', message);
    // });

     // Message status updates
    socket.on('messageStatus', async ({ messageId, status, userId }) => {
      const message = await Message.findByIdAndUpdate(
        messageId,
        { status },
        { new: true }
      ).populate('sender receiver');
      
      if (status === 'read') {
        io.to(userId).emit('messageRead', message);
      } else {
        io.to(message.receiver.socketId).emit('messageStatusUpdate', message);
      }
    });


        // Message edits
    socket.on('editMessage', async ({ messageId, newContent, userId }) => {
      const message = await Message.findByIdAndUpdate(
        messageId,
        { 
          content: newContent,
          'edited.isEdited': true,
          'edited.editedAt': new Date()
        },
        { new: true }
      ).populate('sender receiver');
      
      io.to(message.receiver._id).emit('messageEdited', message);
    });


     // Message deletion
      socket.on('deleteMessage', async ({ messageId, userId }) => {
      const message = await Message.findByIdAndUpdate(
        messageId,
        {
          'deleted.isDeleted': true,
          'deleted.deletedAt': new Date()
        },
        { new: true }
      ).populate('sender receiver');
      
      io.to(message.receiver._id).emit('messageDeleted', message);
    });
    // // Handle sending messages
    // socket.on('sendMessage', async ({ senderId, receiverId, content }) => {
    //   try {
    //     // Save message to database
    //     const message = new Message({
    //       sender: senderId,
    //       receiver: receiverId,
    //       content
    //     });
        
    //     await message.save();
        
    //     // Emit to sender and receiver
    //     io.to(receiverId).emit('receiveMessage', message);
    //     io.to(senderId).emit('receiveMessage', message);
    //   } catch (error) {
    //     console.error('Error sending message:', error);
    //   }
    // });

    socket.on('sendMessage', async ({ senderId, receiverId, content }) => {
  try {
    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content
    });
    
    const savedMessage = await message.save();
    const populatedMessage = await Message.populate(savedMessage, {
      path: 'sender receiver',
      select: 'username'
    });
    
    // Send the complete message with populated sender/receiver
    io.to(receiverId).emit('receiveMessage', populatedMessage);
    io.to(senderId).emit('receiveMessage', populatedMessage);
  } catch (error) {
    console.error('Error saving message:', error);
  }
});


socket.on('messageReaction', async ({ messageId, emoji, userId }) => {
  try {
    const message = await Message.findById(messageId);
    if (!message) return;

    const existingReaction = message.reactions.find(r => r.emoji === emoji);
    if (existingReaction) {
      if (!existingReaction.users.includes(userId)) {
        existingReaction.users.push(userId);
        existingReaction.count += 1;
      }
    } else {
      message.reactions.push({
        emoji,
        users: [userId],
        count: 1
      });
    }

    await message.save();
    io.to(message.sender).emit('updateReactions', message);
    io.to(message.receiver).emit('updateReactions', message);
  } catch (error) {
    console.error('Error handling reaction:', error);
  }
});
    
        socket.on('disconnect', async () => {
      const user = await User.findOneAndUpdate(
        { socketId: socket.id },
        { 
          isOnline: false,
          lastSeen: new Date()
        }
      );
      if (user) {
        io.emit('userStatusChanged', { userId: user._id, isOnline: false });
      }
    });

  });
};