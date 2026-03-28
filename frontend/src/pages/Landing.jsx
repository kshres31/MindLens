import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Eye, Brain, Shield, Users, MessageCircle, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI-Powered Check-ins', desc: 'Daily mood and wellness tracking with intelligent insights powered by GPT', color: 'from-blue-500 to-indigo-500' },
  { icon: Shield, title: 'Private Journaling', desc: 'AES-256 encrypted journal entries — your thoughts stay yours', color: 'from-purple-500 to-pink-500' },
  { icon: Users, title: 'Therapist Finder', desc: 'Find verified mental health professionals near you, with ratings and contact info', color: 'from-teal-500 to-green-500' },
  { icon: MessageCircle, title: 'AI Companion "Lens"', desc: 'Chat with your personal wellness companion for support, breathing exercises, and motivation', color: 'from-orange-400 to-rose-500' },
];

export default function Landing() {
  const { login, loginWithGoogle, register } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let user;
      if (isLogin) {
        user = await login(form.email, form.password);
      } else {
        user = await register(form.name, form.email, form.password);
      }
      toast.success(`Welcome${user.name ? ', ' + user.name.split(' ')[0] : ''}! 👋`);
      navigate(user.onboardingComplete ? '/dashboard' : '/onboarding');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const user = await loginWithGoogle(credentialResponse.credential);
      toast.success(`Welcome, ${user.name?.split(' ')[0]}! 👋`);
      navigate(user.onboardingComplete ? '/dashboard' : '/onboarding');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-accent-900">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 backdrop-blur p-1.5 rounded-lg">
            <Eye className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-2xl text-white">MindLens</span>
        </div>
        <div className="text-white/60 text-sm hidden sm:block">AI-Powered Wellness Platform</div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left: Hero */}
        <div>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white/80 px-4 py-1.5 rounded-full text-sm mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Mental Wellness
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Track your daily{' '}
            <span className="bg-gradient-to-r from-wellness-300 to-primary-300 bg-clip-text text-transparent">
              balance, energy, focus,
            </span>{' '}
            and stress
          </h1>
          <p className="text-white/70 text-lg mb-8 leading-relaxed">
            MindLens helps you understand your emotional patterns, journal privately, connect with therapists, and get personalized AI guidance — all in one calming space.
          </p>

          {/* Feature list */}
          <div className="space-y-3 mb-10">
            {['Daily mood & wellness check-ins with AI insights', 'End-to-end encrypted private journal', 'Find therapists near you', 'Chat with AI companion Lens anytime'].map(f => (
              <div key={f} className="flex items-center gap-2.5 text-white/80">
                <CheckCircle className="h-5 w-5 text-wellness-400 flex-shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-3">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-colors">
                <div className={`bg-gradient-to-br ${color} p-2 rounded-lg w-fit mb-3`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">{title}</h3>
                <p className="text-white/60 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Auth Form */}
        <div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            {/* Toggle */}
            <div className="flex bg-white/10 rounded-xl p-1 mb-8">
              {['Login', 'Register'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setIsLogin(tab === 'Login')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                    (isLogin && tab === 'Login') || (!isLogin && tab === 'Register')
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              {!isLogin && (
                <input
                  type="text"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-primary-300 focus:bg-white/15 transition-colors"
                />
              )}
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-primary-300 focus:bg-white/15 transition-colors"
              />
              <input
                type="password"
                placeholder="Password (6+ characters)"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-primary-300 focus:bg-white/15 transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-white/20" />
              <span className="text-white/40 text-sm">or continue with</span>
              <div className="flex-1 h-px bg-white/20" />
            </div>

            {/* Google Login */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google login failed')}
                theme="filled_black"
                shape="pill"
                size="large"
                text={isLogin ? 'signin_with' : 'signup_with'}
              />
            </div>

            <p className="text-center text-white/40 text-xs mt-6">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
