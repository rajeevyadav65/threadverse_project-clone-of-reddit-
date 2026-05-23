'use client';
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { aiApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Message { role: 'user' | 'ai'; content: string; time: string; }

export default function AIChatWidget() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: "Hey! I'm ThreadVerse AI 🤖 Ask me to summarize posts, explain topics, suggest communities, or help you write better comments!", time: 'now' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await aiApi.chat(input);
      const aiMsg: Message = {
        role: 'ai',
        content: res.data.reply || "Sorry, I couldn't process that.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      // Yahan ab exact error console mein print hoga!
      console.error("AI Request Failed: ", error);
      setMessages(prev => [...prev, { role: 'ai', content: 'Oops! I ran into an error. Check your browser console (F12) for details.', time: 'now' }]);
    } finally { setLoading(false); }
  };

  if (!isAuthenticated) return null;

  return (
      <>
        <button
            onClick={() => setOpen(!open)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#f97316] text-white shadow-lg flex items-center justify-center hover:bg-[#ea6c0a] transition-all hover:scale-105 active:scale-95"
            title="ThreadVerse AI Assistant"
        >
          {open ? <X size={22} /> : <Sparkles size={22} />}
          {!open && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center text-[9px] font-bold">AI</span>
          )}
        </button>

        {open && (
            <div className="fixed bottom-24 right-6 z-50 w-80 bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
              <div className="flex items-center gap-3 p-4 border-b border-[#30363d] bg-gradient-to-r from-[#1c2128] to-[#161b22]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-[#f97316] flex items-center justify-center">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">ThreadVerse AI</div>
                  <div className="text-xs text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                    Powered by GPT-4o-mini
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="ml-auto text-[#8b949e] hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-80 min-h-48">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      {msg.role === 'ai' && (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-[#f97316] flex items-center justify-center flex-shrink-0 mt-1">
                            <Sparkles size={10} className="text-white" />
                          </div>
                      )}
                      <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                          msg.role === 'user'
                              ? 'bg-[#f97316] text-white rounded-br-sm'
                              : 'bg-[#21262d] text-[#e6edf3] rounded-bl-sm'
                      }`}>
                        {msg.content}
                        <div className="text-[10px] opacity-50 mt-1 text-right">{msg.time}</div>
                      </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-[#f97316] flex items-center justify-center flex-shrink-0">
                        <Sparkles size={10} className="text-white" />
                      </div>
                      <div className="bg-[#21262d] rounded-xl rounded-bl-sm px-3 py-3 flex gap-1">
                        {[0,1,2].map(i => (
                            <span key={i} className="w-1.5 h-1.5 bg-[#8b949e] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    </div>
                )}
                <div ref={bottomRef} />
              </div>

              <div className="p-3 border-t border-[#30363d] flex gap-2">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && send()}
                    placeholder="Ask me anything..."
                    className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2 text-sm text-[#e6edf3] placeholder:text-[#8b949e] outline-none focus:border-[#f97316] transition-colors"
                    disabled={loading}
                />
                <button
                    onClick={send}
                    disabled={!input.trim() || loading}
                    className="w-9 h-9 rounded-xl bg-[#f97316] flex items-center justify-center disabled:opacity-40 hover:bg-[#ea6c0a] transition-all active:scale-95"
                >
                  {loading ? <Loader2 size={14} className="animate-spin text-white" /> : <Send size={14} className="text-white" />}
                </button>
              </div>
            </div>
        )}
      </>
  );
}