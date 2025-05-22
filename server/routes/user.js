// routes/user.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAllUsers, updateLanguage } = require('../controllers/userController');
const User = require('../models/User');  // ✅ Needed for inline profile route

// GET /api/users - Public or admin-only access
router.get('/', getAllUsers);

// GET /api/user/profile - Returns logged-in user's profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('username psychology language');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Failed to load user profile' });
  }
});

// POST /api/user/update-language - Optional: for multilingual support
// router.post('/update-language', auth, updateLanguage);

module.exports = router;
