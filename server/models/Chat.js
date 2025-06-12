import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastRead: Date
}, { _id: false });

const chatSchema = new mongoose.Schema({
  participants: [participantSchema],
  isGroup: {
    type: Boolean,
    default: false
  },
  groupName: String,
  groupPhoto: String,
  groupAdmins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  pinnedMessages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  customSettings: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
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

// Indexes
chatSchema.index({ participants: 1 });
chatSchema.index({ updatedAt: -1 });

// Virtual for unread count
chatSchema.virtual('unreadCount', {
  ref: 'Message',
  localField: 'lastMessage',
  foreignField: '_id',
  count: true,
  match: {
    status: { $ne: 'read' }
  }
});

// Pre-save hook to ensure 2 participants for direct chats
chatSchema.pre('save', function(next) {
  if (!this.isGroup && this.participants.length !== 2) {
    throw new Error('Direct chats must have exactly 2 participants');
  }
  next();
});

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;