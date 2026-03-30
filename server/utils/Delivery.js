const path = require('path');
const nodemailer = require('nodemailer');
const Memory = require('../models/Memory');
const Nominee = require('../models/Nominee');




// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send one memory to its nominee
const deliverMemory = async (memory) => {
  try {
    // Get nominee details
    const nominee = await Nominee.findById(memory.nomineeId);
    if (!nominee || !nominee.email) {
      console.log('No nominee or email found for memory:', memory._id);
      return;
    }

    // Build email content based on memory type
    let emailBody = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px;">
        <h2 style="color: #8b5e1a;">A message has been left for you</h2>
        <p>Dear ${nominee.name},</p>
        <p>Someone who loved you has left you a memory titled:</p>
        <h3 style="color: #c9a84c;">"${memory.title}"</h3>
    `;

    if (memory.type === 'letter' && memory.textContent) {
      emailBody += `
        <div style="background:#faf7f2; padding:24px; border-left:4px solid #c9a84c; margin:20px 0;">
          <p>${memory.textContent}</p>
        </div>
      `;
    }

    if (memory.fileUrl) {
      emailBody += `
        <p>They also left you a ${memory.type}:</p>
        <a href="${memory.fileUrl}" 
           style="background:#1a1208; color:white; padding:12px 24px; 
                  text-decoration:none; border-radius:6px; display:inline-block;">
          Open ${memory.type}
        </a>
      `;
    }

    emailBody += `
        <p style="margin-top:40px; color:#6b6355; font-size:14px;">
          This message was stored in Legacy Locker and delivered with love.
        </p>
      </div>
    `;

    // Send the email
    await transporter.sendMail({
      from:    `"Legacy Locker" <${process.env.EMAIL_USER}>`,
      to:      nominee.email,
      subject: `A message for you: "${memory.title}"`,
      html:    emailBody,
    });

    // Mark memory as delivered in DB
    await Memory.findByIdAndUpdate(memory._id, { isDelivered: true });

    console.log(`Memory delivered to ${nominee.email}`);

  } catch (err) {
    console.error('Delivery error:', err.message);
  }
};

// Deliver ALL on_death memories for a user
const deliverAllOnDeath = async (userId) => {
  const memories = await Memory.find({
    userId,
    triggerType: 'on_death',
    isDelivered: false,
    isSealed:    true,
  });

  console.log(`Delivering ${memories.length} memories for user ${userId}`);

  for (const memory of memories) {
    await deliverMemory(memory);
  }
};

module.exports = { deliverMemory, deliverAllOnDeath };
