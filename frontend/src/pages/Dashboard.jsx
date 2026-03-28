import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { ClipboardCheck, MessageCircle, Users, BookOpen, TrendingUp, Lightbulb, Flame, Sparkles, ArrowRight } from 'lucide-react';

const metricColors = {
  mood: '#6366f1',
  energy: '#f59e0b',
  sleep: '#3b82f6',
  stress: '#ef4444',
  focus: '#10b981',
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Dashboard() {
  const { user } = useAuth();
  const [trends, setTrends] = useState(null);
  const [insights, setInsights] = useState(null);
  const [tips, setTips] = useState([]);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [trendsRes, insightsRes, tipsRes, journalsRes] = await Promise.allSettled([
          api.get('/checkins/trends'),
          api.get('/ai/insights'),
          api.get('/ai/tips'),
          api.get('/journal'),
        ]);
        if (trendsRes.status === 'fulfilled') setTrends(trendsRes.value.data);
        if (insightsRes.status === 'fulfilled') setInsights(insightsRes.value.data);
        if (tipsRes.status === 'fulfilled') setTips(tipsRes.value.data.tips || []);
        if (journalsRes.status === 'fulfilled') setJournals(journalsRes.value.data.slice(0, 3));
      } catch (err) {
        toast.error('Failed to load some data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const chartData = trends?.checkIns?.slice().reverse().map(c => ({
    date: formatDate(c.date),
    mood: c.mood,
    energy: c.energy,
    sleep: c.sleep,
    stress: c.stress,
    focus: c.focus,
  })) || [];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-accent-50/30">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {greeting}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-gray-500 mt-1">Here's your wellness overview</p>
          </div>
          <div className="flex items-center gap-3">
            {user?.streak > 0 && (
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 text-orange-600 px-4 py-2 rounded-xl font-medium">
                <Flame className="h-5 w-5" />
                <span>{user.streak} day streak!</span>
              </div>
            )}
            <Link
              to="/checkin"
              className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white px-5 py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity shadow-lg shadow-primary-200"
            >
              <ClipboardCheck className="h-4 w-4" />
              Daily Check-in
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick Stats */}
            {trends?.averages && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { key: 'mood', label: 'Mood', emoji: '😊' },
                  { key: 'energy', label: 'Energy', emoji: '⚡' },
                  { key: 'sleep', label: 'Sleep', emoji: '😴' },
                  { key: 'stress', label: 'Stress', emoji: '😤' },
                  { key: 'focus', label: 'Focus', emoji: '🎯' },
                ].map(({ key, label, emoji }) => (
                  <div key={key} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
                    <div className="text-2xl mb-1">{emoji}</div>
                    <div className="text-2xl font-bold text-gray-900">{trends.averages[key] || '—'}</div>
                    <div className="text-xs text-gray-500">{label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Charts */}
            {chartData.length > 0 ? (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="h-5 w-5 text-primary-600" />
                  <h2 className="font-semibold text-gray-900">7-Day Wellness Trends</h2>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                    <Legend />
                    {Object.entries(metricColors).map(([key, color]) => (
                      <Line key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center">
                <div className="text-5xl mb-4">📊</div>
                <h3 className="text-gray-900 font-semibold mb-2">No data yet</h3>
                <p className="text-gray-500 mb-4">Complete your first check-in to see your wellness trends.</p>
                <Link to="/checkin" className="inline-flex items-center gap-2 text-primary-600 font-medium hover:underline">
                  Start Check-in <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
              {/* AI Insights */}
              <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Sparkles className="h-5 w-5 text-accent-600" />
                  <h2 className="font-semibold text-gray-900">AI Insights</h2>
                </div>
                {insights ? (
                  <div className="space-y-3">
                    {insights.aiSummary && (
                      <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-4 border border-primary-100">
                        <p className="text-gray-700 leading-relaxed">{insights.aiSummary}</p>
                      </div>
                    )}
                    {insights.insights?.map((insight, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="text-primary-500 mt-0.5">•</div>
                        <p className="text-gray-700 text-sm">{insight}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Complete a check-in to get AI insights.</p>
                )}
              </div>

              {/* Tips & Journal */}
              <div className="space-y-4">
                {/* Daily Tip */}
                {tips.length > 0 && (
                  <div className="bg-gradient-to-br from-wellness-500 to-teal-600 rounded-3xl p-5 text-white">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="h-5 w-5" />
                      <span className="font-semibold">Daily Wellness Tip</span>
                    </div>
                    <p className="text-white/90 text-sm leading-relaxed">{tips[0]}</p>
                  </div>
                )}

                {/* Recent Journal */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-accent-600" />
                      <span className="font-semibold text-gray-900 text-sm">Recent Journal</span>
                    </div>
                    <Link to="/journal" className="text-primary-600 text-xs hover:underline">View all</Link>
                  </div>
                  {journals.length > 0 ? (
                    <div className="space-y-3">
                      {journals.map(j => (
                        <div key={j._id} className="p-3 bg-gray-50 rounded-xl">
                          <p className="text-gray-700 text-xs line-clamp-2">{j.content}</p>
                          <p className="text-gray-400 text-xs mt-1.5">🔒 {new Date(j.date).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-400 text-sm">No journal entries yet</p>
                      <Link to="/journal" className="text-primary-600 text-xs hover:underline mt-1 inline-block">Write your first entry</Link>
                    </div>
                  )}
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/companion" className="flex flex-col items-center gap-2 bg-gradient-to-br from-accent-50 to-purple-100 rounded-2xl p-4 hover:opacity-80 transition-opacity border border-accent-100">
                    <MessageCircle className="h-6 w-6 text-accent-600" />
                    <span className="text-xs font-medium text-accent-700">Talk to Lens</span>
                  </Link>
                  <Link to="/therapists" className="flex flex-col items-center gap-2 bg-gradient-to-br from-wellness-50 to-teal-100 rounded-2xl p-4 hover:opacity-80 transition-opacity border border-wellness-100">
                    <Users className="h-6 w-6 text-wellness-600" />
                    <span className="text-xs font-medium text-wellness-700">Find Therapist</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
