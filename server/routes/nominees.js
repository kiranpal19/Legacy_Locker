const path = require('path');
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/Verifyt
  oken');

const Nominee = require('../models/Nominee');

// POST /api/nominees — add a new nominee
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, relation, phone, email } = req.body;

    if (!name || !relation || !phone) {
      return res.status(400).json({ message: 'Name, relation and phone are required' });
    }

    // Check if nominee with same phone already exists for this user
    const existing = await Nominee.findOne({ userId: req.user.userId, phone });
    if (existing) {
      return res.status(400).json({ message: 'Nominee with this phone already exists' });
    }

    const nominee = await Nominee.create({
      userId:   req.user.userId,
      name,
      relation,
      phone,
      email:    email || null,
      isVerified: false,
    });

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