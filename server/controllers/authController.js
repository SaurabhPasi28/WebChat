import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { createError } from '../utils/errorHandler.js';

export const signup = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    console.log("------------->username",username);
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    console.log("------------->username----1",username);
    if (existingUser) {
      return next(createError(400, 'Username already exist'));
    }
    
    // Create new user
    console.log("------------->username2",username);
    const user = new User({ username, password });
    await user.save();
    console.log("------------->username3",process.env.JWT_SECRET);
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    console.log("------------->username4",username);
    res.status(201).json({ token, userId: user._id, username: user.username });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return next(createError(401, 'Invalid credentials'));
    }
    
    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(createError(401, 'Invalid credentials'));
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.json({ token, userId: user._id, username: user.username });
  } catch (error) {
    next(error);
  }
};