import { useState, useEffect } from 'react';
import { Trophy, Calendar, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export function Streak() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/streak/history');
        setHistory(data);
      } catch (error) {
        console.error('Failed to fetch streak history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Streak History</h1>
        <p className="text-slate-500 mt-2">Your recent LeetCode problem completions.</p>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <Trophy className="text-orange-500" />
          <h2 className="text-xl font-bold text-slate-900">Last 30 Days</h2>
        </div>
        
        <div className="divide-y divide-slate-100">
          {history.length > 0 ? (
            history.map((item) => (
              <div key={item._id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{item.problemSlug}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                      <Calendar className="w-4 h-4" />
                      {item.date}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-medium text-slate-500">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500">
              No completions found in the last 30 days.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
