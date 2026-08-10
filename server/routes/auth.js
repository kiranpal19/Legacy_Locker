const path     = require('path');
const express  = require('express');
const router   = express.Router();
const admin    = require('firebase-admin');
const jwt      = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User     = require('../models/User');
const verifyToken = require('../middleware/verifyToken');

// ── Strict rate limiter for auth endpoints (5 req / 10 min) ──
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth attempts. Please wait 10 minutes.' },
});

// ── Initialize Firebase Admin (once) ─────────────────────────
if (!admin.apps.length) {
  try {
    let serviceAccount;
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      // Production: loaded from env var (JSON string)
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
    } else {
      // Local dev: load from serviceAccount.json file
      serviceAccount = require(path.join(__dirname, '../serviceAccount.json'));
    }
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    console.log('Firebase Admin initialized');
  } catch (err) {
    console.error('Firebase init failed:', err.message);
  }
}

// ── POST /api/auth/verify — Firebase Phone OTP → JWT ─────────
router.post('/verify', authLimiter, async (req, res) => {
  try {
    const { idToken, name, email } = req.body;
    if (!idToken) return res.status(400).json({ message: 'idToken is required' });

    const decoded = await admin.auth().verifyIdToken(idToken);
    const phone   = decoded.phone_number;
    if (!phone) return res.status(400).json({ message: 'Phone number not found in token' });

    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ phone, name: name || null, email: email || null });
    }

    const token = jwt.sign(
      { userId: user._id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    res.json({ token, user });
  } catch (err) {
    console.error('Auth verify error:', err.message);
    res.status(401).json({ message: 'Authentication failed', error: err.message });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── POST /api/auth/dev-login — DEV ONLY ──────────────────────
router.post('/dev-login', authLimiter, async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'Not available in production' });
  }
  try {
    const { phone, email } = req.body;
    if (!phone) return res.status(400).json({ message: 'phone is required' });

    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ phone, name: 'Dev User', email: email || 'dev@legacylocker.dev' });
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