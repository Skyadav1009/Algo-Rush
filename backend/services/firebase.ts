import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// In production, you would use a service account key
// For this AI Studio environment, we'll use a mock or environment variable if provided
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin initialized');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
  }
} else {
  console.warn('FIREBASE_SERVICE_ACCOUNT not found. Push notifications will be mocked.');
}

export async function sendNotification(token: string, title: string, body: string) {
  if (!admin.apps.length) {
    console.log(`[MOCK NOTIFICATION] To: ${token} | Title: ${title} | Body: ${body}`);
    return;
  }

  try {
    await admin.messaging().send({
      token,
      notification: {
        title,
        body,
      },
    });
    console.log(`Notification sent to ${token}`);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}
