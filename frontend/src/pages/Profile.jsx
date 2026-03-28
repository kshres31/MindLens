import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Mail, Flame, ClipboardCheck, Bell, Shield, LogOut, Save } from 'lucide-react';

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState({
    notifications: user?.preferences?.notifications ?? true,
    theme: user?.preferences?.theme || 'dark',
  });
  const [saving, setSaving] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      await api.patch('/auth/me', { preferences });
      updateUser({ preferences: { ...user?.preferences, ...preferences } });
      toast.success('Preferences saved');
    } catch {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary-50/30">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Profile</h1>

        {/* Avatar & Info */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-4">
          <div className="flex items-center gap-5">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-20 w-20 rounded-full object-cover shadow-md" />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
              <div className="flex items-center gap-1.5 text-gray-500 mt-1 text-sm">
                <Mail className="h-3.5 w-3.5" /> {user?.email}
              </div>
              {user?.googleId && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-full mt-2">
                  Google Account
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="h-6 w-6 text-orange-500" />
              <span className="text-3xl font-bold text-gray-900">{user?.streak || 0}</span>
            </div>
            <p className="text-sm text-gray-500">Day Streak</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <ClipboardCheck className="h-6 w-6 text-primary-500" />
              <span className="text-3xl font-bold text-gray-900">{user?.totalCheckIns || '—'}</span>
            </div>
            <p className="text-sm text-gray-500">Total Check-ins</p>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-4">
          <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary-500" /> Privacy &amp; Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700 flex items-center gap-2">
                  <Bell className="h-4 w-4 text-gray-500" /> Notifications
                </p>
                <p className="text-sm text-gray-400">Daily check-in reminders</p>
              </div>
              <button
                onClick={() => setPreferences(p => ({ ...p, notifications: !p.notifications }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.notifications ? 'bg-primary-500' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${preferences.notifications ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-500" /> Journal Encryption
                </p>
                <p className="text-sm text-gray-400">AES-256 encryption (always on)</p>
              </div>
              <span className="text-xs bg-wellness-50 text-wellness-700 px-2.5 py-1 rounded-full font-medium">Enabled</span>
            </div>
          </div>
          <button
            onClick={handleSavePreferences}
            disabled={saving}
            className="mt-5 flex items-center gap-2 bg-primary-50 hover:bg-primary-100 text-primary-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
          >
            {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600" /> : <Save className="h-4 w-4" />}
            Save Preferences
          </button>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-4">
          <h3 className="font-semibold text-gray-900 mb-4">Account</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span className="text-gray-400">Member since</span>
              <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last check-in</span>
              <span>{user?.lastCheckIn ? new Date(user.lastCheckIn).toLocaleDateString() : 'Never'}</span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 border-2 border-red-200 text-red-500 hover:bg-red-50 font-semibold py-3 rounded-2xl transition-colors"
        >
          <LogOut className="h-5 w-5" /> Sign Out
        </button>
      </main>
    </div>
  );
}
