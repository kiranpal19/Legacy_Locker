const path = require('path');
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
// const User = require('../models/User');

const User = require(path.join(__dirname, '../models/User'));

// Initialize Firebase Admin (only once)
// if (!admin.apps.length) {
// const path = require('path');
// const serviceAccount = require(path.join(__dirname, '../serviceAccount.json'));
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
//   });
if (!admin.apps.length) {
  let serviceAccount;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    serviceAccount = require(path.join(__dirname, '../serviceAccount.json'));
  }
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
// POST /api/auth/verify
// Frontend sends Firebase idToken, we return our own JWT
router.post('/verify', async (req, res) => {
  try {
    const { idToken, name, email } = req.body;

    // 1. Verify the Firebase token
    const decoded = await admin.auth().verifyIdToken(idToken);
    const phone = decoded.phone_number;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number not found in token' });
    }

    // 2. Find or create user in MongoDB
    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ phone, name, email });
    }

    // 3. Issue our own JWT
    const token = jwt.sign(
      { userId: user._id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ token, user });

  } catch (err) {
    console.error('Auth error:', err.message);
    res.status(401).json({ message: 'Authentication failed', error: err.message });
  }
});

// POST /api/auth/me — get current user from JWT
router.get('/me', require('../middleware/verifyToken'), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DEV ONLY — get a token without Firebase
// Remove this before going live
router.post('/dev-login', async (req, res) => {
  try {
    const { phone } = req.body;

    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({
        phone,
        name: 'Test User',
        email: req.body.email || 'test@gmail.com',
      });
    }

    const token = jwt.sign(
      { userId: user._id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;