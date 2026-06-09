import type { Section } from '../types';
import { SECTIONS } from '../types';

interface HeaderProps {
  activeSection: string;
  onSectionChange: (id: string) => void;
  lastUpdated: Date | null;
  chatOpen: boolean;
  onChatToggle: () => void;
}

export default function Header({
  activeSection,
  onSectionChange,
  lastUpdated,
  chatOpen,
  onChatToggle,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-[#0a0f1e]/95 backdrop-blur border-b border-slate-800">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-6">
        {/* Top row */}
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="font-semibold text-white tracking-tight">NewsLens</span>
              <span className="hidden sm:inline text-slate-500 text-sm">AI News Analytics</span>
            </div>

            {lastUpdated && (
              <div className="hidden md:flex items-center gap-1.5 ml-4">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-slate-500">
                  Live · {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onChatToggle}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              chatOpen
                ? 'bg-blue-500 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 pb-2 overflow-x-auto scrollbar-none">
          {SECTIONS.map((s: Section) => (
            <button
              key={s.id}
              onClick={() => onSectionChange(s.id)}
              className={`flex-shrink-0 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeSection === s.id
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              style={activeSection === s.id ? { backgroundColor: s.color + '22', color: s.color } : {}}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
