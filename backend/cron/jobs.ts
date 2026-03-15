import cron from 'node-cron';
import { DailyProblem } from '../models/DailyProblem.js';
import { User } from '../models/User.js';
import { Completion } from '../models/Completion.js';
import { fetchDailyProblem, fetchRecentSubmissions } from '../services/leetcode.js';
import { sendNotification } from '../services/firebase.js';
import { format, subDays, isSameDay } from 'date-fns';

export async function initCronJobs() {
  // Fetch today's problem on startup if missing
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    const existingProblem = await DailyProblem.findOne({ date: today });
    if (!existingProblem) {
      console.log('Daily problem for today not found. Fetching on startup...');
      const problemData = await fetchDailyProblem();
      await DailyProblem.findOneAndUpdate(
        { date: today },
        { ...problemData, date: today },
        { upsert: true, new: true }
      );
    }
  } catch (err) {
    console.error('Failed to fetch daily problem on startup:', err);
  }

  // 1. Fetch Daily Problem at 12:00 AM UTC
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily problem fetcher...');
    try {
      const problemData = await fetchDailyProblem();
      const today = format(new Date(), 'yyyy-MM-dd');

      await DailyProblem.findOneAndUpdate(
        { date: today },
        { ...problemData, date: today },
        { upsert: true, new: true }
      );

      console.log(`Fetched daily problem: ${problemData.title}`);

      // Send daily reminder to all users
      const users = await User.find({ pushNotificationToken: { $exists: true, $ne: null } });
      for (const user of users) {
        if (user.pushNotificationToken) {
          sendNotification(
            user.pushNotificationToken,
            "🔥 New Daily Problem!",
            `Today's problem is ${problemData.title}. Don't break your streak!`
          );
        }
      }
    } catch (error) {
      console.error('Failed to fetch daily problem in cron:', error);
    }
  });

  // 2. Check Submissions Every 5 Minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log('Running submission checker...');
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const dailyProblem = await DailyProblem.findOne({ date: today });

      if (!dailyProblem) {
        console.log('No daily problem found for today. Skipping submission check.');
        return;
      }

      const users = await User.find();

      for (const user of users) {
        // Skip if already solved today
        const alreadySolved = await Completion.findOne({ userId: user._id, date: today });
        if (alreadySolved) continue;

        // Fetch recent submissions
        const submissions = await fetchRecentSubmissions(user.leetcodeUsername);
        
        // Check if any submission matches today's problem
        const solvedToday = submissions.some((sub: any) => {
          const subDate = new Date(parseInt(sub.timestamp) * 1000);
          return sub.titleSlug === dailyProblem.slug && isSameDay(subDate, new Date());
        });

        if (solvedToday) {
          console.log(`User ${user.leetcodeUsername} solved today's problem!`);
          
          // Mark completion
          await Completion.create({
            userId: user._id,
            problemSlug: dailyProblem.slug,
            date: today,
          });

          // Update streak
          let newStreak = 1;
          const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
          
          if (user.lastSolvedDate === yesterday) {
            newStreak = user.currentStreak + 1;
          } else if (user.lastSolvedDate === today) {
            newStreak = user.currentStreak; // Already updated
          }

          const longestStreak = Math.max(user.longestStreak, newStreak);

          await User.findByIdAndUpdate(user._id, {
            currentStreak: newStreak,
            longestStreak,
            lastSolvedDate: today,
          });

          // Send congratulatory notification
          if (user.pushNotificationToken) {
            sendNotification(
              user.pushNotificationToken,
              "🔥 Streak Maintained!",
              "Great job solving today's LeetCode problem."
            );
          }
        }
      }
    } catch (error) {
      console.error('Failed to check submissions in cron:', error);
    }
  });

  // 3. Reminder at 6:00 PM UTC
  cron.schedule('0 18 * * *', async () => {
    sendReminders("⏰ Evening Reminder", "Don't forget to solve today's LeetCode problem!");
  });

  // 4. Final Reminder at 10:00 PM UTC
  cron.schedule('0 22 * * *', async () => {
    sendReminders("🚨 Final Warning!", "Only 2 hours left to maintain your LeetCode streak!");
  });
}

async function sendReminders(title: string, body: string) {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    const users = await User.find({ pushNotificationToken: { $exists: true, $ne: null } });

    for (const user of users) {
      const solved = await Completion.findOne({ userId: user._id, date: today });
      if (!solved && user.pushNotificationToken) {
        sendNotification(user.pushNotificationToken, title, body);
      }
    }
  } catch (error) {
    console.error('Failed to send reminders:', error);
  }
}
