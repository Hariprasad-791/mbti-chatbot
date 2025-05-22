
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


exports.summarizeAnswers = async (req, res) => {
  const { questions, answers } = req.body;
  const userId = req.userId;

  if (!questions || !answers || questions.length !== answers.length) {
    return res.status(400).json({ error: "Invalid input: questions and answers must match" });
  }

  try {
    // 🌐 Call Gemini-based Flask API
    const geminiResponse = await axios.post('http://127.0.0.1:5001/summarize', {
      questions,
      answers
    });

    const summary = geminiResponse.data.summary;

    // 📩 Send to local MBTI predictor
    const mlResponse = await axios.post('http://127.0.0.1:5001/predict', {
      text: summary
    });

    const mbti = mlResponse.data.mbti;

    // 💾 Save to MongoDB
    await User.findByIdAndUpdate(userId, {
      $set: {
        'psychology.mbti': mbti,
        'psychology.lastUpdated': new Date()
      },
      $push: {
        chatInteractions: {
          message: summary,
          mbti,
          timestamp: new Date()
        }
      }
    });

    res.json({ summary, mbti });

  } catch (err) {
    console.error("❌ Gemini or MBTI error:", err.message);
    res.status(500).json({ error: "Failed to summarize or predict MBTI." });
  }
};




