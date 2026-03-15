import mongoose from 'mongoose';

const dailyProblemSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // YYYY-MM-DD
  title: { type: String, required: true },
  slug: { type: String, required: true },
  difficulty: { type: String, required: true },
}, { timestamps: true });

export const DailyProblem = mongoose.model('DailyProblem', dailyProblemSchema);
