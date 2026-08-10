const cron = require('node-cron');
const Memory  = require('../models/Memory');
const Nominee = require('../models/Nominee');
const { deliverMemory } = require('./delivery');

/**
 * Run every hour — deliver memories whose triggerDate has passed.
 */
const scheduleDateTriggers = () => {
  cron.schedule('0 * * * *', async () => {
    console.log('[Scheduler] Checking date-triggered memories…');
    try {
      const now = new Date();
      const due = await Memory.find({
        triggerType: 'date',
        triggerDate: { $lte: now },
        isDelivered: false,
        isSealed:    true,
      });
      console.log(`[Scheduler] Found ${due.length} date-triggered memories to deliver`);
      for (const memory of due) await deliverMemory(memory);
    } catch (err) {
      console.error('[Scheduler] Date trigger error:', err.message);
    }
  });
};

/**
 * Run every day at midnight — deliver memories to nominees on their 18th birthday.
 */
const scheduleAge18Triggers = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('[Scheduler] Checking age-18 triggers…');
    try {
      const today    = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Find nominees whose 18th birthday falls today
      const nominees = await Nominee.find({ birthDate: { $exists: true, $ne: null } });

      for (const nominee of nominees) {
        const dob = new Date(nominee.birthDate);
        const eighteenth = new Date(dob);
        eighteenth.setFullYear(dob.getFullYear() + 18);
        eighteenth.setHours(0, 0, 0, 0);

        if (eighteenth >= today && eighteenth < tomorrow) {
          console.log(`[Scheduler] 🎂 ${nominee.name} turns 18 today — delivering memories`);
          const memories = await Memory.find({
            nomineeId:   nominee._id,
            triggerType: 'age_18',
            isDelivered: false,
            isSealed:    true,
          });
          for (const memory of memories) await deliverMemory(memory);
        }
      }
    } catch (err) {
      console.error('[Scheduler] Age-18 trigger error:', err.message);
    }
  });
};

/**
 * Start all scheduled jobs.
 */
const startScheduler = () => {
  scheduleDateTriggers();
  scheduleAge18Triggers();
  console.log('[Scheduler] ✅ All cron jobs started (date: hourly, age_18: daily midnight)');
};

module.exports = { startScheduler };
