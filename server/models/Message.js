// import mongoose from 'mongoose';

// const messageSchema = new mongoose.Schema({
//   sender: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   receiver: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   content: {
//     type: String,
//     required: true,
//     trim: true,
//     maxlength: 1000
//   },
//   read: {
//     type: Boolean,
//     default: false
//   }
// }, { timestamps: true });

// const Message = mongoose.model('Message', messageSchema);
// export default Message;



import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema({
  emoji: {
    type: String,
    required: true
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  count: {
    type: Number,
    default: 1
  }
}, { _id: false });

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  reactions: [reactionSchema],
  edited: {
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date
  },
  deleted: {
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  attachments: [{
    type: String // URLs to files
  }]
}, { 
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for faster queries
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ 'reactions.emoji': 1 });

// Static method to mark messages as read
messageSchema.statics.markAsRead = async function(senderId, receiverId) {
  return this.updateMany(
    { 
      sender: senderId, 
      receiver: receiverId,
      status: { $ne: 'read' }
    },
    { $set: { status: 'read' } }
  );
};

// Static method to add reaction
messageSchema.statics.addReaction = async function(messageId, emoji, userId) {
  const message = await this.findById(messageId);
  if (!message) return null;

  const reactionIndex = message.reactions.findIndex(r => r.emoji === emoji);
  
  if (reactionIndex >= 0) {
    // Reaction exists - check if user already reacted
    const userIndex = message.reactions[reactionIndex].users.indexOf(userId);
    if (userIndex === -1) {
      message.reactions[reactionIndex].users.push(userId);
      message.reactions[reactionIndex].count += 1;
    }
  } else {
    // New reaction
    message.reactions.push({
      emoji,
      users: [userId],
      count: 1
    });
  }

  return message.save();
};

const Message = mongoose.model('Message', messageSchema);
export default Message;