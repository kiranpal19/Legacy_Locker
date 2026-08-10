const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const verifyToken = require('../middleware/verifyToken');
const Memory = require('../models/Memory');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer — store file in memory before uploading to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB max
});

// Helper — upload buffer to Cloudinary
const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
    stream.end(buffer);
  });
};

// POST /api/memories/upload — upload a memory (with optional file)
router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const { title, type, nomineeId, triggerType, triggerDate, textContent } = req.body;

    if (!title || !type || !triggerType) {
      return res.status(400).json({ message: 'title, type and triggerType are required' });
    }

    let fileUrl = null;

    // Upload file to Cloudinary if one was attached
    if (req.file) {
      const resourceType =
        type === 'video' ? 'video' :
        type === 'voice' ? 'video' : 'image';

      const result = await uploadToCloudinary(req.file.buffer, {
        folder:        'legacy-locker',
        resource_type: resourceType,
      });
      fileUrl = result.secure_url;
    }

    const memory = await Memory.create({
      userId:      req.user.userId,
      title,
      type,
      fileUrl,
      textContent: textContent || null,
      nomineeId:   nomineeId   || null,
      triggerType,
      triggerDate: triggerDate || null,
      isSealed:    true,
    });

    res.status(201).json({ message: 'Memory sealed successfully', memory });

  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

// GET /api/memories — get all memories for logged-in user
router.get('/', verifyToken, async (req, res) => {
  try {
    const memories = await Memory.find({ userId: req.user.userId })
      .populate('nomineeId', 'name relation')
      .sort({ createdAt: -1 });
    res.json(memories);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/memories/:id — get single memory
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const memory = await Memory.findOne({
      _id:    req.params.id,
      userId: req.user.userId,
    }).populate('nomineeId', 'name relation');

    if (!memory) return res.status(404).json({ message: 'Memory not found' });
    res.json(memory);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/memories/:id — delete a memory
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const memory = await Memory.findOneAndDelete({
      _id:    req.params.id,
      userId: req.user.userId,
    });
    if (!memory) return res.status(404).json({ message: 'Memory not found' });
    res.json({ message: 'Memory deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/memories/:id — update allowed fields only (sanitized)
router.patch('/:id', verifyToken, async (req, res) => {
  try {
    // Whitelist: only these fields may be updated by the client
    const { title, triggerType, triggerDate, nomineeId, textContent } = req.body;
    const allowedUpdate = {};
    if (title       !== undefined) allowedUpdate.title       = title;
    if (triggerType !== undefined) allowedUpdate.triggerType = triggerType;
    if (triggerDate !== undefined) allowedUpdate.triggerDate = triggerDate;
    if (nomineeId   !== undefined) allowedUpdate.nomineeId   = nomineeId;
    if (textContent !== undefined) allowedUpdate.textContent = textContent;

    const memory = await Memory.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      allowedUpdate,
      { new: true }
    );
    if (!memory) return res.status(404).json({ message: 'Memory not found' });
    res.json({ message: 'Memory updated', memory });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
