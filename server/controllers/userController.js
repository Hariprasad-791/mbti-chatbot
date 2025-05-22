const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // exclude hashed passwords
    res.status(200).json({
      status: 'success',
      count: users.length,
      data: users
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message || 'Failed to fetch users'
    });
  }
};

exports.updateLanguage = async (req, res) => {
  try {
    const { language } = req.body;
    const userId = req.userId;
    
    if (!['en', 'kn', 'hi', 'te'].includes(language)) {
      return res.status(400).json({ message: 'Invalid language code' });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { language },
      { new: true }
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        language: updatedUser.language
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message || 'Failed to update language preference'
    });
  }
};