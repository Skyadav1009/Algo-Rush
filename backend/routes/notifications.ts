import express from 'express';
import { User } from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', authenticate, async (req: any, res: any) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    await User.findByIdAndUpdate(req.userId, { pushNotificationToken: token });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register notification token' });
  }
});

export default router;
