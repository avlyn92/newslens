import { useState } from 'react';

interface SetupModalProps {
  onSave: (guardianKey: string, openaiKey: string) => void;
}

export default function SetupModal({ onSave }: SetupModalProps) {
  const [guardianKey, setGuardianKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [showGuardian, setShowGuardian] = useState(false);
  const [showOpenai, setShowOpenai] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!guardianKey.trim()) return;
    onSave(guardianKey.trim(), openaiKey.trim());
  }

  return (
    <div className="fixed inset-0 bg-[#0a0f1e] flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">NewsLens</h1>
            <p className="text-xs text-slate-500">AI-Powered News Analytics</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-5"
        >
          <div>
            <h2 className="text-base font-semibold text-white mb-1">Connect your data sources</h2>
            <p className="text-sm text-slate-500">
              Paste your API keys to load live news and enable AI chat.
            </p>
          </div>

          {/* Guardian API Key */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <span className="w-5 h-5 rounded-md bg-emerald-500/20 flex items-center justify-center">
                <span className="text-emerald-400 text-xs">G</span>
              </span>
              Guardian API Key
              <span className="text-red-400 text-xs">*required</span>
            </label>
            <div className="relative">
              <input
                type={showGuardian ? 'text' : 'password'}
                value={guardianKey}
                onChange={e => setGuardianKey(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-blue-500 transition-colors pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowGuardian(!showGuardian)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
              >
                {showGuardian ? '🙈' : '👁️'}
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Free at{' '}
              <a href="https://open-platform.theguardian.com/access/" target="_blank" rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-400 underline">
                open-platform.theguardian.com
              </a>{' '}— takes ~1 minute
            </p>
          </div>

          {/* OpenAI API Key */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <span className="w-5 h-5 rounded-md bg-purple-500/20 flex items-center justify-center">
                <span className="text-purple-400 text-xs">AI</span>
              </span>
              OpenAI API Key
              <span className="text-slate-600 text-xs">(for AI chat)</span>
            </label>
            <div className="relative">
              <input
                type={showOpenai ? 'text' : 'password'}
                value={openaiKey}
                onChange={e => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-blue-500 transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowOpenai(!showOpenai)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
              >
                {showOpenai ? '🙈' : '👁️'}
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Get yours at{' '}
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-400 underline">
                platform.openai.com
              </a>{' '}· Uses gpt-4o-mini (~$0.001/query)
            </p>
          </div>

          <button
            type="submit"
            disabled={!guardianKey.trim()}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm rounded-xl py-3 transition-colors"
          >
            Launch Dashboard →
          </button>

          <p className="text-xs text-slate-700 text-center">
            Keys are stored in your browser only. Never sent anywhere except the respective APIs.
          </p>
        </form>
      </div>
    </div>
  );
}
