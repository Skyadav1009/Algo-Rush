import { useState, useEffect } from 'react';
import { Bell, User, Globe } from 'lucide-react';
import api from '../services/api';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function Settings() {
  const [user, setUser] = useState<any>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        alert('This browser does not support desktop notification or service workers');
        return;
      }

      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        
        // Get VAPID public key from backend
        const { data } = await api.get('/notifications/vapid-public-key');
        const convertedVapidKey = urlBase64ToUint8Array(data.publicKey);
        
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        });
        
        await api.post('/notifications/register', { subscription });
        setNotificationsEnabled(true);
        alert('Notifications enabled successfully!');
      } else {
        alert('Notification permission denied');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      alert('Failed to enable notifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-2">Manage your account and preferences.</p>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <User className="text-orange-500" />
          <h2 className="text-xl font-bold text-slate-900">Profile Information</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">LeetCode Username</label>
              <input
                type="text"
                disabled
                value={user?.leetcodeUsername || ''}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <Bell className="text-orange-500" />
          <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">Push Notifications</h3>
              <p className="text-sm text-slate-500 mt-1">Receive reminders to solve your daily problem.</p>
            </div>
            
            <button
              onClick={handleEnableNotifications}
              disabled={loading || notificationsEnabled}
              className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                notificationsEnabled 
                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
            >
              {loading ? 'Enabling...' : notificationsEnabled ? 'Enabled' : 'Enable'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <Globe className="text-orange-500" />
          <h2 className="text-xl font-bold text-slate-900">Timezone</h2>
        </div>
        
        <div className="p-6">
          <p className="text-slate-900 font-medium">
            {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Your timezone is automatically detected and used for daily problem resets.
          </p>
        </div>
      </div>
    </div>
  );
}
