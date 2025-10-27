import mongoose from 'mongoose';

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
    required: function() {
      // Content is required only if there's no file attachment
      return !this.fileUrl;
    },
    trim: true,
    maxlength: 2000
  },
  // File attachment fields
  fileUrl: {
    type: String,
    default: null
  },
  fileType: {
    type: String,
    enum: ['image', 'video', 'document', 'audio', 'other', null],
    default: null
  },
  fileName: {
    type: String,
    default: null
  },
  fileSize: {
    type: Number,
    default: null
  },
  cloudinaryPublicId: {
    type: String,
    default: null
  },
  // Message status
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  readAt: {
    type: Date,
    default: null
  }
}, { 
  timestamps: true,
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
});

// Indexes for faster queries
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ createdAt: -1 });

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

const Message = mongoose.model('Message', messageSchema);
export default Message;