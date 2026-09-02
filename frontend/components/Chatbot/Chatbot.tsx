'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const t = (key: { en: string; ur: string }, lang: 'en' | 'ur') => lang === 'ur' ? key.ur : key.en;

export default function Chatbot() {
  const [language, setLanguage] = useState<'en' | 'ur'>('en');
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const lang = (typeof window !== 'undefined' ? localStorage.getItem('civicai_lang') : null) as 'en' | 'ur' | null;
    setLanguage(lang || 'en');
  }, []);

  useEffect(() => {
    setMessages([{
      role: 'assistant',
      content: t({
        en: 'Hello! I\'m your CivicAI assistant. I can help you file complaints, track issues, or answer questions about civic services. How can I help?',
        ur: 'ہیلو! میں آپ کا CivicAI اسسٹنٹ ہوں۔ میں آپ کو شکایات درج کرنے، مسائل ٹریک کرنے، یا شہری خدمات کے بارے میں سوالات کے جوابات دینے میں مدد کر سکتا ہوں۔ میں آپ کی کیا مدد کر سکتا ہوں؟'
      }, language),
    }]);
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const history = updatedMessages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history }),
      });

      const data = await res.json();

      if (data.success && data.data?.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: t({ en: 'Sorry, I couldn\'t process that. Please try again.', ur: 'معذرت، میں اسے پروسیس نہیں کر سکا۔ براہ کرم دوبارہ کوشش کریں۔' }, language) }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: t({ en: 'Connection error. Please check your internet and try again.', ur: 'کنکشن کی خرابی۔ براہ کرم اپنا انٹرنیٹ چیک کریں اور دوبارہ کوشش کریں۔' }, language) }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Window */}
      <div
        className={`fixed bottom-24 right-4 sm:right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="bg-white rounded-2xl shadow-large border border-neutral-200/80 flex flex-col overflow-hidden" style={{ height: '500px', maxHeight: 'calc(100vh - 8rem)' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-secondary-600 to-secondary-500 px-4 py-3 flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-sm">CivicAI Assistant</h3>
              <p className="text-white/70 text-xs">{t({ en: 'Ask me anything about civic issues', ur: 'شہری مسائل کے بارے میں کچھ بھی پوچھیں' }, language)}</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors p-1"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-neutral-50/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-secondary-600 text-white rounded-br-md'
                      : 'bg-white text-neutral-800 border border-neutral-200 rounded-bl-md shadow-soft'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-neutral-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-soft">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-neutral-100 bg-white shrink-0">
              {[
                { en: 'How to file a complaint?', ur: 'شکایت کیسے درج کریں؟' },
                { en: 'Track my complaint', ur: 'میری شکایت ٹریک کریں' },
                { en: 'What issues can I report?', ur: 'کون سے مسائل رپورٹ کر سکتا ہوں؟' },
              ].map((q) => (
                <button
                  key={q.en}
                  onClick={() => { setInput(q.en); }}
                  className="text-xs px-2.5 py-1.5 rounded-full bg-secondary-50 text-secondary-700 hover:bg-secondary-100 transition-colors border border-secondary-200"
                >
                  {t(q, language)}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 border-t border-neutral-200 bg-white shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t({ en: 'Type your message...', ur: 'اپنا پیغام لکھیں...' }, language)}
                className="flex-1 px-3 py-2.5 text-sm border border-neutral-300 rounded-xl bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary-500/40 focus:border-secondary-500 transition-all placeholder:text-neutral-400"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="p-2.5 rounded-xl bg-gradient-to-r from-secondary-600 to-secondary-500 text-white hover:from-secondary-700 hover:to-secondary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shrink-0 shadow-sm"
                aria-label="Send message"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 sm:right-6 z-50 w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl ${
          isOpen
            ? 'bg-neutral-600 hover:bg-neutral-700 rotate-0'
            : 'bg-gradient-to-br from-secondary-500 to-accent-500 hover:from-secondary-400 hover:to-accent-400 animate-bounce-subtle'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="5" y="8" width="14" height="10" rx="3" strokeWidth={1.5} />
            <circle cx="9.5" cy="13" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="14.5" cy="13" r="1.5" fill="currentColor" stroke="none" />
            <path strokeLinecap="round" strokeWidth={1.5} d="M10 16h4" />
            <path strokeLinecap="round" strokeWidth={1.5} d="M12 4v4" />
            <circle cx="12" cy="3" r="1" fill="currentColor" stroke="none" />
            <path strokeLinecap="round" strokeWidth={1.5} d="M3 12h2M19 12h2" />
          </svg>
        )}
      </button>
    </>
  );
}
