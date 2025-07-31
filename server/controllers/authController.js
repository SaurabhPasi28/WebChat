import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { createError } from '../utils/errorHandler.js';

// Token generation helper
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

export const signup = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    // Validation
    if (!username || !password) {
      return next(createError(400, 'Username and password are required'));
    }

    if (password.length < 6) {
      return next(createError(400, 'Password must be at least 6 characters'));
    }

    // Check existing user
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return next(createError(400, 'Username already exists'));
    }

    // Create user
    const user = new User({ username, password });
    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Set refresh token in cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      token: accessToken,
      userId: user._id,
      username: user.username
    });
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

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(createError(401, 'Invalid credentials'));
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Set refresh token in cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      token: accessToken,
      userId: user._id,
      username: user.username
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return next(createError(401, 'Refresh token missing'));
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const accessToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ token: accessToken });
  } catch (error) {
    next(createError(401, 'Invalid refresh token'));
  }
};

export const logout = async (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
};