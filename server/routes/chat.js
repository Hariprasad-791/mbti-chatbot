const express = require('express');
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');
const router = express.Router();
console.log('chatController:', chatController);

// POST /api/chat/analyze - Analyze message and store interaction
router.post('/analyze', auth, chatController.analyze);

// GET /api/chat/history - Get user's chat history
router.get('/history', auth, chatController.getHistory);
router.post('/update-mbti', auth, chatController.updateMbti);

module.exports = router;
