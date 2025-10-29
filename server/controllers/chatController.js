import Message from '../models/Message.js';
import User from '../models/User.js';
import { createError } from '../utils/errorHandler.js';
import mongoose from 'mongoose';

// Cache setup (optional - for performance)
const userCache = new Map();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

export const getMessages = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { receiverId } = req.params;
    const { before = Date.now(), limit = 50 } = req.query;

    // Validate receiverId
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      throw createError(400, 'Invalid user ID');
    }

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: receiverId },
        { sender: receiverId, receiver: userId }
      ],
      createdAt: { $lt: new Date(parseInt(before)) }
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('sender receiver', 'username avatar status')
      .lean();

    // Mark messages as read if viewing conversation
    if (messages.length > 0) {
      await Message.updateMany(
        {
          sender: receiverId,
          receiver: userId,
          status: { $ne: 'read' }
        },
        { $set: { status: 'read' } }
      );
    }

    res.json(messages.reverse()); // Return oldest first
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { userId } = req.user;
    
    // Check cache first
    if (userCache.has(userId)) {
      const { timestamp, data } = userCache.get(userId);
      if (Date.now() - timestamp < CACHE_TTL) {
        return res.json(data);
      }
    }

    const users = await User.find(
      { _id: { $ne: userId } },
      'username avatar isOnline lastSeen status'
    ).lean();

    // Update cache
    userCache.set(userId, {
      timestamp: Date.now(),
      data: users
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const getChatUsers = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { search } = req.query;

    // Base query for users
    const userQuery = {
      _id: { $ne: userId },
      ...(search && {
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      })
    };

    const [users, messages] = await Promise.all([
      User.find(userQuery, 'username avatar isOnline lastSeen status').lean(),
      Message.aggregate([
        {
          $match: {
            $or: [
              { sender: new mongoose.Types.ObjectId(userId) },
              { receiver: new mongoose.Types.ObjectId(userId) }
            ]
          }
        },
        {
          $sort: { createdAt: -1 }
        },
        {
          $group: {
            _id: {
              $cond: [
                { $eq: ["$sender", mongoose.Types.ObjectId(userId)] },
                "$receiver",
                "$sender"
              ]
            },
            lastMessage: { $first: "$$ROOT" },
            unreadCount: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$receiver", mongoose.Types.ObjectId(userId)] },
                      { $ne: ["$status", "read"] }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ])
    ]);

    const enrichedUsers = users.map(user => {
      const userMessages = messages.find(m => m._id.equals(user._id));
      return {
        ...user,
        lastMessage: userMessages?.lastMessage,
        unreadCount: userMessages?.unreadCount || 0,
        isTyping: false // Can be updated via socket
      };
    });

    // Sort by most recent activity
    enrichedUsers.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || a.lastSeen || 0;
      const bTime = b.lastMessage?.createdAt || b.lastSeen || 0;
      return new Date(bTime) - new Date(aTime);
    });

    res.json(enrichedUsers);
  } catch (error) {
    next(error);
  }
};

export const getUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId, 'isOnline lastSeen status');
    
    if (!user) {
      throw createError(404, 'User not found');
    }

    res.json({
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      status: user.status
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { messageId } = req.params;

    // Validate messageId
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      throw createError(400, 'Invalid message ID');
    }

    // Find the message
    const message = await Message.findById(messageId);
    
    if (!message) {
      throw createError(404, 'Message not found');
    }

    // Check if user is the sender
    if (message.sender.toString() !== userId) {
      throw createError(403, 'You can only delete your own messages');
    }

    // Delete the message
    await Message.findByIdAndDelete(messageId);

    res.json({ 
      success: true, 
      message: 'Message deleted successfully',
      messageId 
    });
  } catch (error) {
    next(error);
  }
};