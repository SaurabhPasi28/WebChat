import Message from '../models/Message.js';
import User from '../models/User.js';
import { createError } from '../utils/errorHandler.js';

export const getMessages = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { receiverId } = req.params;
    
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: receiverId },
        { sender: receiverId, receiver: userId }
      ]
    }).sort('createdAt').populate('sender receiver', 'username');
    
    res.json(messages);
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { userId } = req.user;
    console.log("----------->userId")
    const users = await User.find({ _id: { $ne: userId } }, 'username');
    res.json(users);
  } catch (error) {
    next(error);
  }
};




// Add new endpoints:
export const getChatUsers = async (req, res, next) => {
  try {
    const users = await User.find(
      { _id: { $ne: req.user.userId } },
      'username isOnline lastSeen profilePicture status'
    ).lean();
    
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user.userId },
            { receiver: req.user.userId }
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
              { $eq: ["$sender", req.user.userId] },
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
                    { $eq: ["$receiver", req.user.userId] },
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
    ]);

    const enrichedUsers = users.map(user => {
      const userMessages = messages.find(m => m._id.equals(user._id));
      return {
        ...user,
        lastMessage: userMessages?.lastMessage,
        unreadCount: userMessages?.unreadCount || 0
      };
    });

    res.json(enrichedUsers);
  } catch (error) {
    next(error);
  }
};