const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.status(201).send({ token });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    console.log("------------>login auth.js")
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) throw new Error('User not found');
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.send({ token, userId: user._id, username: user.username });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;