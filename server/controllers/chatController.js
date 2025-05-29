
const User = require('../models/User');
const axios = require('axios');
const translationService = require('../services/translationService');
const summarizeWithGemini = require('../utils/geminiSummarizer'); 
exports.getHistory = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('chatInteractions');
    res.json(user.chatInteractions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

exports.updateMbti = async (req, res) => {
  try {
    const { mbti } = req.body;
    const userId = req.userId;
    
    if (!mbti) {
      return res.status(400).json({ error: 'MBTI type is required' });
    }
    
    // Update user's MBTI
    await User.findByIdAndUpdate(userId, {
      $set: {
        'psychology.mbti': mbti,
        'psychology.lastUpdated': new Date()
      }
    });
    
    res.json({ message: 'MBTI updated successfully', mbti });
  } catch (err) {
    console.error('MBTI update error:', err.message);
    res.status(500).json({ error: 'Failed to update MBTI' });
  }
};


exports.analyze = async (req, res) => {
  try {
    const { message, role = 'user' } = req.body; // role optional, default 'user'
    const userId = req.userId;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get user's language preference
    const user = await User.findById(userId);
    const userLanguage = user?.language || 'en';

    // Save the message with role and language
    await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          chatInteractions: {
            message,
            language: userLanguage,
            role,
            timestamp: new Date()
          }
        }
      }
    );

    res.json({ message: 'Message saved' });
  } catch (err) {
    console.error('Analysis error:', err.message);
    res.status(500).json({
      error: err.message || 'MBTI analysis failed'
    });
  }
};