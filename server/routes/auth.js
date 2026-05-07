// const express = require('express');
// const router = express.Router();
// const admin = require('firebase-admin');
// const jwt = require('jsonwebtoken');
// const path = require('path');
// const User = require('../models/User');

// if (!admin.apps.length) {
//   const serviceAccount = require(path.join(__dirname, '../serviceAccount.json'));
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
//   });
// }

// router.post('/verify', async (req, res) => {
//   try {
//     const { idToken, name, email } = req.body;
//     const decoded = await admin.auth().verifyIdToken(idToken);
//     const phone = decoded.phone_number;

//     if (!phone) {
//       return res.status(400).json({ message: 'Phone number not found in token' });
//     }

//     let user = await User.findOne({ phone });
//     if (!user) {
//       user = await User.create({ phone, name, email });
//     }

//     const token = jwt.sign(
//       { userId: user._id, phone: user.phone },
//       process.env.JWT_SECRET,
//       { expiresIn: '30d' }
//     );

//     res.json({ token, user });

//   } catch (err) {
//     console.error('Auth error:', err.message);
//     res.status(401).json({ message: 'Authentication failed', error: err.message });
//   }
// });

// router.get('/me', require('../middleware/verifyToken'), async (req, res) => {
//   try {
//     const user = await User.findById(req.user.userId);
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken');

// Initialize Firebase
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (err) {
    console.error('Firebase init failed:', err.message);
  }
}

// GET /api/auth/me
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/dev-login — DEV ONLY
router.post('/dev-login', async (req, res) => {
  try {
    const { phone, email } = req.body;
    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({
        phone,
        name: 'Test User',
        email: email || 'test@gmail.com',
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