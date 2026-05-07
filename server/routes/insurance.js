const path = require('path');
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const User = require('../models/User');
const { deliverAllOnDeath } = require('../utils/delivery');





// POST /api/insurance/webhook
// Called by insurance company when claim is settled
router.post('/webhook', async (req, res) => {
  try {
    const { policyId, event, secret } = req.body;

    // Basic security check — insurer must send the right secret
    if (secret !== process.env.JWT_SECRET) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (event === 'CLAIM_SETTLED') {
      // Find user by their policy ID
      const user = await User.findOne({ insurancePolicyId: policyId });

      if (!user) {
        return res.status(404).json({ message: 'No user found for this policy' });
      }

      // Trigger delivery of all on_death memories
      await deliverAllOnDeath(user._id);

      return res.json({ message: 'Memories delivered successfully' });
    }

    res.json({ message: 'Event received but no action taken' });

  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/insurance/link — user links their policy to their account
router.post('/link', verifyToken, async (req, res) => {
  try {
    const { policyId, insurerName } = req.body;

    if (!policyId) {
      return res.status(400).json({ message: 'Policy ID is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { insurancePolicyId: policyId },
      { new: true }
    );

    res.json({ message: 'Policy linked successfully', user });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/insurance/status — check if user has linked a policy
router.get('/status', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    res.json({
      linked: !!user.insurancePolicyId,
      policyId: user.insurancePolicyId || null,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/insurance/test-trigger — manually test delivery (dev only)
router.post('/test-trigger', verifyToken, async (req, res) => {
  try {
    await deliverAllOnDeath(req.user.userId);
    res.json({ message: 'Test delivery triggered' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
