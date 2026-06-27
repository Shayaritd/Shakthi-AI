import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Loader2, Shield } from 'lucide-react';
import type { ChatMessage } from '../types';
import { chatWithAssistant } from '../services/gemini';

interface AiChatProps {
  onClose: () => void;
}

const QUICK_PROMPTS = [
  'How do I improve my Kabaddi skills?',
  'Help me find scholarships for my sport',
  'I feel unsafe, what should I do?',
  'How do I prepare for college admissions?',
];

export function AiChat({ onClose }: AiChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: `Namaste! I'm SHAKTHI AI, your personal sports companion.\n\nI'm here to help you with scholarships, mentor matching, safety guidance, college admissions, and more.\n\nWhat's on your mind today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const reply = await chatWithAssistant(messages, content);
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: reply, timestamp: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function formatContent(text: string) {
    return text.split('\n').map((line, i) => {
      const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return (
        <span key={i} className="block" dangerouslySetInnerHTML={{ __html: bold || '&nbsp;' }} />
      );
    });
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="w-full max-w-[430px] bg-white rounded-t-3xl flex flex-col"
        style={{ height: '85dvh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="teal-gradient px-4 py-4 rounded-t-3xl flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-sm">SHAKTHI AI Assistant</h2>
              <p className="text-white/70 text-xs">Safe, supportive, always here</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Safety notice */}
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-start gap-2 flex-shrink-0">
          <Shield size={13} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-amber-700">
            AI guidance only. Not legal or medical advice. For emergencies, call 112.
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 bg-[#1a7a6e] rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                  <Sparkles size={13} className="text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] px-3 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai text-gray-800'
                }`}
              >
                {formatContent(msg.content)}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 bg-[#1a7a6e] rounded-full flex items-center justify-center mr-2 mt-1">
                <Sparkles size={13} className="text-white" />
              </div>
              <div className="chat-bubble-ai px-4 py-3 flex items-center gap-2">
                <Loader2 size={16} className="text-[#1a7a6e] animate-spin" />
                <span className="text-xs text-gray-500">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 flex gap-2 overflow-x-auto flex-shrink-0 pb-2">
            {QUICK_PROMPTS.map(p => (
              <button
                key={p}
                onClick={() => sendMessage(p)}
                className="flex-shrink-0 text-xs bg-[#e8f5f3] text-[#1a7a6e] px-3 py-1.5 rounded-full font-medium hover:bg-[#d0ede9] transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
          <div className="flex gap-2 items-center bg-gray-50 rounded-2xl px-4 py-2.5 border border-gray-200 focus-within:border-[#1a7a6e] focus-within:bg-white transition-all">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me anything..."
              className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-8 h-8 bg-[#1a7a6e] rounded-full flex items-center justify-center disabled:opacity-40 transition-opacity flex-shrink-0"
            >
              <Send size={14} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
