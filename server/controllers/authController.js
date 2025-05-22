const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate existing user using single query
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    }).collation({ locale: 'en', strength: 2 }); // Case-insensitive search

    if (existingUser) {
      let message = 'Username already exists';
      if (existingUser.email.toLowerCase() === email.toLowerCase()) {
        message = 'Email already exists';
      }
      return res.status(409).json({ message });
    }

    const newUser = await User.create({ username, email, password });
    
    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      status: 'success',
      token,
      user: newUser
    });

  } catch (err) {
    res.status(400).json({ 
      message: err.message.includes('validation failed') 
        ? 'Invalid data format' 
        : 'Registration failed' 
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Find user with case-insensitive email search
    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') }
    }).select('+password');

    // Verify credentials
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      status: 'success',
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });

  } catch (err) {
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

