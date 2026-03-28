import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Eye, ArrowRight, ArrowLeft } from 'lucide-react';

const steps = [
  { key: 'sleep', label: "How has your sleep been?", emoji: '😴', description: 'Rate your average sleep quality over the past few days', color: 'from-blue-400 to-indigo-500' },
  { key: 'energy', label: "How's your energy level?", emoji: '⚡', description: 'How energized do you feel day to day?', color: 'from-yellow-400 to-orange-500' },
  { key: 'stress', label: "How stressed have you been?", emoji: '😤', description: "1 = very relaxed, 10 = very stressed", color: 'from-red-400 to-rose-500' },
  { key: 'focus', label: "How's your focus?", emoji: '🎯', description: 'How well are you able to concentrate on tasks?', color: 'from-teal-400 to-green-500' },
];

function getLabel(key, val) {
  if (key === 'stress') {
    if (val <= 3) return 'Very relaxed';
    if (val <= 5) return 'Mild stress';
    if (val <= 7) return 'Moderate stress';
    return 'High stress';
  }
  if (val <= 3) return 'Low';
  if (val <= 5) return 'Fair';
  if (val <= 7) return 'Good';
  return 'Excellent';
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({ sleep: 5, energy: 5, stress: 5, focus: 5 });
  const [loading, setLoading] = useState(false);

  const current = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(s => s + 1);
    } else {
      setLoading(true);
      try {
        await api.post('/checkins', { ...values, mood: Math.round((values.sleep + values.energy + (10 - values.stress) + values.focus) / 4) });
        // Try to update onboarding complete status
        try {
          await api.patch('/auth/me', { onboardingComplete: true });
        } catch {
          // Endpoint may not exist - not critical
        }
        updateUser({ onboardingComplete: true });
        toast.success('Welcome to MindLens! 🎉');
        navigate('/dashboard');
      } catch (err) {
        toast.error('Failed to save. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10">
        <div className="bg-gradient-to-br from-primary-500 to-accent-500 p-2 rounded-xl">
          <Eye className="h-6 w-6 text-white" />
        </div>
        <span className="font-bold text-2xl text-gray-800">MindLens</span>
      </div>

      <div className="w-full max-w-md">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Step {step + 1} of {steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className={`bg-gradient-to-br ${current.color} text-white text-5xl w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6`}>
            {current.emoji}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">{current.label}</h2>
          <p className="text-gray-500 text-center mb-8">{current.description}</p>

          {/* Slider */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-400 mb-3">
              <span>1</span>
              <span className="font-semibold text-primary-600 text-base">
                {values[current.key]} — {getLabel(current.key, values[current.key])}
              </span>
              <span>10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={values[current.key]}
              onChange={e => setValues({ ...values, [current.key]: Number(e.target.value) })}
              className="w-full h-3 rounded-full accent-primary-500 cursor-pointer"
              style={{ accentColor: '#6366f1' }}
            />
            {/* Dots */}
            <div className="flex justify-between mt-2">
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <div key={n} className={`h-2 w-2 rounded-full transition-colors ${n <= values[current.key] ? 'bg-primary-500' : 'bg-gray-200'}`} />
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  {step === steps.length - 1 ? 'Get Started 🚀' : 'Next'}
                  {step < steps.length - 1 && <ArrowRight className="h-4 w-4" />}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${i === step ? 'w-6 bg-primary-500' : i < step ? 'w-2 bg-primary-300' : 'w-2 bg-gray-200'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
