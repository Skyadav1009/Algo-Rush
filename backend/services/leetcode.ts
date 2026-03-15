import axios from 'axios';

const LEETCODE_API_URL = 'https://leetcode.com/graphql';

export async function fetchDailyProblem() {
  const query = `
    query questionOfToday {
      activeDailyCodingChallengeQuestion {
        date
        link
        question {
          title
          titleSlug
          difficulty
        }
      }
    }
  `;

  try {
    const response = await axios.post(LEETCODE_API_URL, { query });
    const data = response.data.data.activeDailyCodingChallengeQuestion;
    
    return {
      date: data.date,
      title: data.question.title,
      slug: data.question.titleSlug,
      difficulty: data.question.difficulty,
    };
  } catch (error) {
    console.error('Error fetching daily problem:', error);
    throw error;
  }
}

export async function fetchRecentSubmissions(username: string) {
  const query = `
    query recentAcSubmissions($username: String!, $limit: Int!) {
      recentAcSubmissionList(username: $username, limit: $limit) {
        id
        title
        titleSlug
        timestamp
      }
    }
  `;

  try {
    const response = await axios.post(LEETCODE_API_URL, {
      query,
      variables: { username, limit: 15 },
    });
    
    return response.data.data.recentAcSubmissionList || [];
  } catch (error) {
    console.error(`Error fetching submissions for ${username}:`, error);
    return [];
  }
}
