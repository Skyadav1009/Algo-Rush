import express from 'express';
import { DailyProblem } from '../models/DailyProblem.js';
import { format } from 'date-fns';

const router = express.Router();

router.get('/today', async (req, res) => {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    const problem = await DailyProblem.findOne({ date: today });
    
    if (!problem) {
      return res.status(404).json({ error: 'Daily problem not found for today' });
    }
    
    res.json(problem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch daily problem' });
  }
});

export default router;
