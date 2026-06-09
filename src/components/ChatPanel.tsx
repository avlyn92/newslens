import { useState, useRef, useEffect } from 'react';
import type { ChatMessage, Article } from '../types';
import { streamChatResponse } from '../api';

interface ChatPanelProps {
  articles: Article[];
  openaiKey: string;
  isOpen: boolean;
}

const SUGGESTED_PROMPTS = [
  "What are today's biggest stories?",
  "Summarize the top business news",
  "What's happening in technology?",
  "Any major political developments?",
  "What's trending in sports today?",
];

export default function ChatPanel({ articles, openaiKey, isOpen }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  async function sendMessage(text: string) {
    if (!text.trim() || isStreaming) return;
    if (!openaiKey) {
      setError('Add your OpenAI API key in the setup panel to enable AI chat.');
      return;
    }

    setError('');
    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsStreaming(true);

    // Placeholder for streaming response
    const assistantMsg: ChatMessage = { role: 'assistant', content: '', timestamp: new Date() };
    setMessages(prev => [...prev, assistantMsg]);

    await streamChatResponse(
      newMessages,
      articles,
      openaiKey,
      (chunk) => {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: updated[updated.length - 1].content + chunk,
          };
          return updated;
        });
      },
      () => setIsStreaming(false),
      (err) => {
        setError(err);
        setIsStreaming(false);
        setMessages(prev => prev.slice(0, -1)); // remove empty assistant msg
      }
    );
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div
      className={`fixed right-0 top-0 h-full w-full sm:w-96 bg-[#0d1423] border-l border-slate-800 flex flex-col z-40 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">NewsLens AI</p>
          <p className="text-xs text-slate-500">
            {articles.length > 0 ? `${articles.length} articles loaded` : 'Loading news...'}
          </p>
        </div>
        <div className="ml-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
              <p className="text-sm text-slate-300 leading-relaxed">
                Hi! I'm your news analyst. I've read today's Guardian headlines — ask me anything.
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-2 uppercase tracking-wide">Try asking</p>
              <div className="flex flex-col gap-2">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="text-left text-xs text-slate-400 hover:text-blue-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg px-3 py-2 transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message-enter flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex-shrink-0 flex items-center justify-center mr-2 mt-0.5">
                <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm0 18a8 8 0 100-16 8 8 0 000 16z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-[#1e293b] text-slate-200 rounded-bl-sm'
              }`}
            >
              {msg.content || (
                isStreaming && i === messages.length - 1 ? (
                  <span className="flex items-center gap-1 h-4">
                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
                  </span>
                ) : '...'
              )}
            </div>
          </div>
        ))}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-xs text-red-400">
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-slate-800">
        <div className="flex gap-2 items-end bg-[#1e293b] rounded-xl border border-slate-700 focus-within:border-blue-500 transition-colors p-1">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about today's news..."
            rows={1}
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 resize-none outline-none px-3 py-2 max-h-28"
            style={{ minHeight: '38px' }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
            className="flex-shrink-0 w-8 h-8 mb-1 mr-1 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-slate-700 text-center mt-2">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
