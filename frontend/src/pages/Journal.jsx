import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, Lock, Trash2, Edit3, X, Save, Tag } from 'lucide-react';

const moodOptions = [
  { value: 1, label: 'Terrible', emoji: '😢' },
  { value: 3, label: 'Bad', emoji: '😕' },
  { value: 5, label: 'Okay', emoji: '😐' },
  { value: 7, label: 'Good', emoji: '🙂' },
  { value: 9, label: 'Great', emoji: '😄' },
];

const tagOptions = ['grateful', 'anxious', 'hopeful', 'tired', 'motivated', 'calm', 'frustrated', 'excited', 'sad', 'proud'];

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ content: '', mood: 5, tags: [] });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchEntries = async () => {
    try {
      const res = await api.get('/journal');
      setEntries(res.data);
    } catch {
      toast.error('Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEntries(); }, []);

  const handleSave = async () => {
    if (!form.content.trim()) { toast.error('Please write something'); return; }
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/journal/${editId}`, form);
        toast.success('Entry updated');
      } else {
        await api.post('/journal', form);
        toast.success('Entry saved 🔒');
      }
      setComposing(false);
      setEditId(null);
      setForm({ content: '', mood: 5, tags: [] });
      fetchEntries();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (entry) => {
    setEditId(entry._id);
    setForm({ content: entry.content, mood: entry.mood || 5, tags: entry.tags || [] });
    setComposing(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/journal/${id}`);
      toast.success('Entry deleted');
      setEntries(entries.filter(e => e._id !== id));
    } catch {
      toast.error('Failed to delete entry');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleTag = (tag) => {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-accent-50/30">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Private Journal</h1>
            <p className="text-gray-500 flex items-center gap-1.5 mt-1 text-sm">
              <Lock className="h-3.5 w-3.5" /> All entries are encrypted end-to-end
            </p>
          </div>
          <button
            onClick={() => { setComposing(true); setEditId(null); setForm({ content: '', mood: 5, tags: [] }); }}
            className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white px-4 py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity shadow-lg shadow-primary-200"
          >
            <Plus className="h-4 w-4" /> New Entry
          </button>
        </div>

        {/* Compose Modal */}
        {composing && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900">{editId ? 'Edit Entry' : 'New Journal Entry'}</h2>
                  <button onClick={() => setComposing(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                {/* Mood selector */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">How are you feeling?</label>
                  <div className="flex gap-2">
                    {moodOptions.map(m => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, mood: m.value }))}
                        className={`flex-1 flex flex-col items-center p-2 rounded-xl border-2 transition-colors ${form.mood === m.value ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <span className="text-xl">{m.emoji}</span>
                        <span className="text-xs text-gray-600 mt-1">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="mb-4">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                    <Tag className="h-3.5 w-3.5" /> Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tagOptions.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${form.tags.includes(tag) ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <textarea
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="What's on your mind today? Write freely — this is your private space..."
                  rows={8}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-primary-400 resize-none"
                  autoFocus
                />
                <div className="text-xs text-gray-400 text-right mt-1">{form.content.length} characters</div>

                <div className="flex gap-3 mt-4">
                  <button onClick={() => setComposing(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <><Save className="h-4 w-4" /> Save Entry</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Entries List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📓</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No journal entries yet</h3>
            <p className="text-gray-500 mb-6">Start writing your first private, encrypted entry.</p>
            <button
              onClick={() => setComposing(true)}
              className="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              Write your first entry
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map(entry => (
              <div key={entry._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs text-gray-400">
                        {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {entry.mood && (
                        <span className="text-sm">{moodOptions.slice().reverse().find(m => m.value <= entry.mood)?.emoji || '😐'}</span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        <Lock className="h-2.5 w-2.5" /> encrypted
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed line-clamp-3">{entry.content}</p>
                    {entry.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {entry.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-primary-50 text-primary-600 rounded-full text-xs">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleEdit(entry)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Edit3 className="h-4 w-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry._id)}
                      disabled={deletingId === entry._id}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      {deletingId === entry._id
                        ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400" />
                        : <Trash2 className="h-4 w-4 text-red-400" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
