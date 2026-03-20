import { useState, useEffect } from 'react';
import { Bell, User, Globe, Moon, Sun } from 'lucide-react';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

function urlBase64ToUint8Array(base64String: string) {
// ... (rest of the helper remains same)
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
  const { theme, toggleTheme } = useTheme();

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
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your account and preferences.</p>
      </header>

      {/* Profile Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <User className="text-orange-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Profile Information</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">LeetCode Username</label>
              <input
                type="text"
                disabled
                value={user?.leetcodeUsername || ''}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Display Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          {theme === 'dark' ? <Moon className="text-orange-500" /> : <Sun className="text-orange-500" />}
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Display Settings</h2>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Adjust the appearance of Algo-Rush.</p>
            </div>
            
            <button
              onClick={toggleTheme}
              className={`relative w-14 h-8 rounded-full p-1 transition-colors duration-300 outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                theme === 'dark' ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                }`}
              >
                {theme === 'dark' ? (
                  <Moon className="w-3.5 h-3.5 text-orange-500" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-orange-400" />
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Bell className="text-orange-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Notifications</h2>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Push Notifications</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Receive reminders to solve your daily problem.</p>
            </div>
            
            <button
              onClick={handleEnableNotifications}
              disabled={loading || notificationsEnabled}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                notificationsEnabled 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 active:scale-95'
              }`}
            >
              {loading ? 'Enabling...' : notificationsEnabled ? 'Enabled' : 'Enable'}
            </button>
          </div>
        </div>
      </div>

      {/* Timezone Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Globe className="text-orange-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Timezone</h2>
        </div>
        
        <div className="p-6">
          <p className="text-slate-900 dark:text-white font-medium">
            {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Your timezone is automatically detected and used for daily problem resets.
          </p>
        </div>
      </div>
    </div>
  );
}
