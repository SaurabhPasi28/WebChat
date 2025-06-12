import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  socketId: String,
  profilePicture: String,
  status: {
    type: String,
    default: "Hey there! I'm using WebChat"
  },
  contacts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { 
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  }
});

// Add lastMessage virtual field
userSchema.virtual('lastMessage', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'sender',
  justOne: true,
  options: { 
    sort: { createdAt: -1 },
    limit: 1
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last seen when user logs out
userSchema.methods.updateLastSeen = function() {
  this.isOnline = false;
  this.lastSeen = Date.now();
  return this.save();
};

// userSchema.virtual('status').get(function() {
//   if (this.isOnline) return 'online';
//   if (this.lastSeen > new Date(Date.now() - 5 * 60 * 1000)) return 'recently';
//   return 'offline';
// });


const User = mongoose.model('User', userSchema);
export default User;