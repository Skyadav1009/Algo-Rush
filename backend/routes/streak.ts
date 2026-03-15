import express from 'express';
import { User } from '../models/User.js';
import { Completion } from '../models/Completion.js';
import { authenticate } from '../middleware/auth.js';
import { format } from 'date-fns';

const router = express.Router();

router.get('/', authenticate, async (req: any, res: any) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const today = format(new Date(), 'yyyy-MM-dd');
    const todayCompletion = await Completion.findOne({ userId: user._id, date: today });

    res.json({
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastSolvedDate: user.lastSolvedDate,
      solvedToday: !!todayCompletion,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch streak data' });
  }
});

router.get('/history', authenticate, async (req: any, res: any) => {
  try {
    const completions = await Completion.find({ userId: req.userId })
      .sort({ date: -1 })
      .limit(30); // Last 30 days
      
    res.json(completions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch streak history' });
  }
});

export default router;
