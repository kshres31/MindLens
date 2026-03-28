import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { Send } from 'lucide-react';

const metrics = [
  { key: 'sleep', label: 'Sleep Quality', emoji: '😴', description: 'How well did you sleep?', lowLabel: 'Poor', highLabel: 'Excellent' },
  { key: 'energy', label: 'Energy Level', emoji: '⚡', description: 'How energized do you feel?', lowLabel: 'Exhausted', highLabel: 'Energized' },
  { key: 'stress', label: 'Stress Level', emoji: '😤', description: 'How stressed are you feeling?', lowLabel: 'Very calm', highLabel: 'Very stressed' },
  { key: 'focus', label: 'Focus', emoji: '🎯', description: 'How well can you concentrate?', lowLabel: 'Scattered', highLabel: 'Razor sharp' },
  { key: 'mood', label: 'Overall Mood', emoji: '😊', description: 'How are you feeling overall?', lowLabel: 'Very low', highLabel: 'Amazing' },
];

function getMoodEmoji(key, val) {
  if (key === 'stress') {
    if (val <= 3) return '😌'; if (val <= 6) return '😕'; return '😰';
  }
  if (val <= 2) return '😢'; if (val <= 4) return '😕'; if (val <= 6) return '😐'; if (val <= 8) return '🙂'; return '😄';
}

function getTrackColor(key, val) {
  if (key === 'stress') {
    if (val <= 3) return '#10b981'; if (val <= 6) return '#f59e0b'; return '#ef4444';
  }
  if (val <= 3) return '#ef4444'; if (val <= 6) return '#f59e0b'; return '#10b981';
}

export default function CheckIn() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [values, setValues] = useState({ sleep: 5, energy: 5, stress: 5, focus: 5, mood: 5 });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/checkins', { ...values, notes });
      updateUser({ streak: res.data.streak });
      setSubmitted(true);
      toast.success('Check-in saved! Great job taking care of yourself 🌟', { duration: 4000 });
      setTimeout(() => navigate('/dashboard'), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save check-in');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-wellness-50 to-primary-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="text-8xl mb-6 animate-bounce">🎉</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Check-in Complete!</h2>
            <p className="text-gray-500 text-lg">Amazing job taking care of your mental wellness!</p>
            <p className="text-gray-400 mt-2">Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/20 to-accent-50/20">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Daily Check-In</h1>
          <p className="text-gray-500">Rate how you're feeling today — takes about 60 seconds</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {metrics.map(({ key, label, emoji, description, lowLabel, highLabel }) => (
            <div key={key} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xl">{emoji}</span>
                    <h3 className="font-semibold text-gray-900">{label}</h3>
                  </div>
                  <p className="text-gray-500 text-sm">{description}</p>
                </div>
                <div className="text-4xl">{getMoodEmoji(key, values[key])}</div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-400 mb-2">
                  <span>{lowLabel}</span>
                  <span className="font-semibold text-gray-700 text-sm">{values[key]}/10</span>
                  <span>{highLabel}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={values[key]}
                  onChange={e => setValues({ ...values, [key]: Number(e.target.value) })}
                  className="w-full h-3 rounded-full cursor-pointer"
                  style={{ accentColor: getTrackColor(key, values[key]) }}
                />
              </div>
              <div className="flex gap-0.5 mt-2">
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <div
                    key={n}
                    onClick={() => setValues({ ...values, [key]: n })}
                    className={`flex-1 h-1.5 rounded-full cursor-pointer transition-colors ${n <= values[key] ? 'opacity-100' : 'bg-gray-100'}`}
                    style={{ backgroundColor: n <= values[key] ? getTrackColor(key, values[key]) : undefined }}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Notes */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-1">📝 Notes <span className="text-gray-400 font-normal text-sm">(optional)</span></h3>
            <p className="text-gray-500 text-sm mb-3">Anything specific on your mind today?</p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Write anything you'd like to remember about today..."
              rows={4}
              maxLength={1000}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-primary-400 resize-none text-sm"
            />
            <div className="text-right text-xs text-gray-400 mt-1">{notes.length}/1000</div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold py-4 rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-primary-200 flex items-center justify-center gap-2 disabled:opacity-60 text-lg"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
            ) : (
              <>
                <Send className="h-5 w-5" />
                Save Check-In
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
