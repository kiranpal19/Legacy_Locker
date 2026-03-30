const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:              { type: String },
  phone:             { type: String, required: true, unique: true },
  email:             { type: String },
  insurancePolicyId: { type: String },
  plan:              { type: String, enum: ['free', 'premium'], default: 'free' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
