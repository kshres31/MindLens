import { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Send, Eye } from 'lucide-react';

const suggestions = [
  { label: '🫁 Help me breathe', message: 'Can you guide me through a breathing exercise?' },
  { label: "😰 I'm stressed", message: "I'm feeling stressed and overwhelmed right now. Can you help?" },
  { label: '💪 Motivate me', message: "I'm feeling low on motivation. Can you help me find some?" },
  { label: '😴 Sleep tips', message: "I've been having trouble sleeping. Any tips?" },
  { label: '🧘 Mindfulness', message: 'Can you guide me through a quick mindfulness exercise?' },
];

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="bg-gradient-to-br from-accent-400 to-primary-500 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0">
        <Eye className="h-4 w-4 text-white" />
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-4">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

export default function Companion() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm Lens, your personal wellness companion 👋 I'm here to support you, help you breathe, provide motivation, or just listen. How are you feeling today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages, loading]);

  const sendMessage = async (text) => {
    const content = text || input.trim();
    if (!content) return;
    setInput('');

    const userMsg = { role: 'user', content };
    const history = [...messages, userMsg];
    setMessages(history);
    setLoading(true);

    try {
      const res = await api.post('/ai/companion', {
        message: content,
        conversationHistory: messages.map(m => ({ role: m.role, content: m.content })),
      });
      setMessages([...history, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      toast.error('Failed to get response from Lens');
      setMessages([...history, { role: 'assistant', content: "I'm having a little trouble right now. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-accent-50/30 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-br from-accent-400 to-primary-500 h-12 w-12 rounded-full flex items-center justify-center shadow-lg">
            <Eye className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">Lens</h1>
            <p className="text-sm text-wellness-600 flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-wellness-500 rounded-full inline-block animate-pulse" />
              Your AI wellness companion
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-1 mb-4 pr-1">
          {messages.map((msg, i) => (
            <div key={i} className={`flex items-end gap-2 mb-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="bg-gradient-to-br from-accent-400 to-primary-500 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0">
                  <Eye className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-primary-500 to-accent-500 text-white rounded-br-sm'
                    : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion chips */}
        {messages.length <= 2 && !loading && (
          <div className="flex flex-wrap gap-2 mb-3">
            {suggestions.map(s => (
              <button
                key={s.label}
                onClick={() => sendMessage(s.message)}
                className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs rounded-full hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 transition-colors shadow-sm"
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-3 items-end">
          <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm focus-within:border-primary-400 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Lens... (Enter to send, Shift+Enter for new line)"
              rows={1}
              className="w-full px-4 py-3 rounded-2xl focus:outline-none resize-none text-sm bg-transparent"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="bg-gradient-to-br from-primary-500 to-accent-500 text-white p-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 flex-shrink-0 shadow-lg"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </main>
    </div>
  );
}
