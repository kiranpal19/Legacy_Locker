const express     = require('express');
const router      = express.Router();
const verifyToken = require('../middleware/verifyToken');
const Nominee     = require('../models/Nominee');
const { sendMail } = require('../utils/email');
const User         = require('../models/User');

// POST /api/nominees — add a new nominee
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, relation, phone, email, birthDate } = req.body;

    if (!name || !relation || !phone) {
      return res.status(400).json({ message: 'Name, relation and phone are required' });
    }

    const existing = await Nominee.findOne({ userId: req.user.userId, phone });
    if (existing) {
      return res.status(400).json({ message: 'Nominee with this phone already exists' });
    }

    const nominee = await Nominee.create({
      userId:    req.user.userId,
      name, relation, phone,
      email:     email     || null,
      birthDate: birthDate || null,
      isVerified: false,
    });

    // Send welcome email to nominee (fire-and-forget, non-blocking)
    if (nominee.email) {
      const owner = await User.findById(req.user.userId).lean();
      const ownerLabel = owner?.name || owner?.phone || 'Someone';
      sendMail({
        to: nominee.email,
        subject: `${ownerLabel} has added you as their Legacy Nominee 🔐`,
        html: `
          <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:32px;background:#faf7f2;border-radius:16px">
            <h1 style="font-size:24px;color:#1a1208;margin-bottom:8px">You're a Legacy Nominee 🔐</h1>
            <p style="color:#6b6355;line-height:1.7;margin-bottom:16px">
              <strong>${ownerLabel}</strong> has added you as a trusted nominee on <strong>Legacy Locker</strong>.
              This means they may have sealed heartfelt memories — letters, videos, voice notes or photos —
              that will be delivered to you at a meaningful moment.
            </p>
            <p style="color:#6b6355;line-height:1.7;margin-bottom:24px">
              You don't need to do anything right now. When the time comes, you'll receive the memories directly
              to this email address.
            </p>
            <div style="background:#fff;border:1px solid #ede7d9;border-radius:12px;padding:20px;margin-bottom:24px">
              <div style="font-size:13px;color:#a89f94;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">Added by</div>
              <div style="font-size:16px;font-weight:600;color:#1a1208">${ownerLabel}</div>
              <div style="font-size:13px;color:#6b6355;margin-top:4px">As: ${nominee.relation}</div>
            </div>
            <p style="font-size:12px;color:#a89f94">You received this because your email was provided as a nominee contact. No action required.</p>
          </div>
        `,
      });
    }

    res.status(201).json({ message: 'Nominee added successfully', nominee });

  } catch (err) {
    console.error('Add nominee error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/nominees — get all nominees for logged in user
router.get('/', verifyToken, async (req, res) => {
  try {
    const nominees = await Nominee.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(nominees);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/nominees/:id — get single nominee
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const nominee = await Nominee.findOne({
      _id:    req.params.id,
      userId: req.user.userId,
    });
    if (!nominee) return res.status(404).json({ message: 'Nominee not found' });
    res.json(nominee);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/nominees/:id/verify — mark nominee as KYC verified
router.patch('/:id/verify', verifyToken, async (req, res) => {
  try {
    const nominee = await Nominee.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { isVerified: true },
      { new: true }
    );
    if (!nominee) return res.status(404).json({ message: 'Nominee not found' });
    res.json({ message: 'Nominee verified successfully', nominee });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/nominees/:id — update nominee details
router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const { name, relation, phone, email } = req.body;
    const nominee = await Nominee.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { name, relation, phone, email },
      { new: true }
    );
    if (!nominee) return res.status(404).json({ message: 'Nominee not found' });
    res.json({ message: 'Nominee updated', nominee });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/nominees/:id — delete a nominee
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const nominee = await Nominee.findOneAndDelete({
      _id:    req.params.id,
      userId: req.user.userId,
    });
    if (!nominee) return res.status(404).json({ message: 'Nominee not found' });
    res.json({ message: 'Nominee deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
