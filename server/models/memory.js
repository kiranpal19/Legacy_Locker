const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true },
  type:        { type: String, enum: ['video', 'letter', 'voice', 'photo'], required: true },
  fileUrl:     { type: String },
  textContent: { type: String },       // for letter type
  nomineeId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Nominee' },
  triggerType: { type: String, enum: ['on_death', 'date', 'age_18'], required: true },
  triggerDate: { type: Date },          // if triggerType is 'date'
  isDelivered: { type: Boolean, default: false },
  isSealed:    { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Memory', memorySchema);