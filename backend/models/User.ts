import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  leetcodeUsername: { type: String, required: true },
  timezone: { type: String, default: 'UTC' },
  pushNotificationToken: { type: String },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastSolvedDate: { type: String }, // YYYY-MM-DD
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
