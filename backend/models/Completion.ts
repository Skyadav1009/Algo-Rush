import mongoose from 'mongoose';

const completionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemSlug: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

// Prevent duplicate completions for the same user and problem on the same day
completionSchema.index({ userId: 1, problemSlug: 1, date: 1 }, { unique: true });

export const Completion = mongoose.model('Completion', completionSchema);
