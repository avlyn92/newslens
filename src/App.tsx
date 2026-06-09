import { useState, useEffect, useCallback } from 'react';
import type { Article } from './types';
import { fetchArticles, fetchMultiSectionArticles } from './api';
import Header from './components/Header';
import MetricsBar from './components/MetricsBar';
import NewsChart from './components/NewsChart';
import HeadlineCard from './components/HeadlineCard';
import ChatPanel from './components/ChatPanel';
import SetupModal from './components/SetupModal';
import './index.css';

const STORAGE_KEY_GUARDIAN = 'newslens_guardian_key';
const STORAGE_KEY_OPENAI   = 'newslens_openai_key';
const REFRESH_INTERVAL_MS  = 5 * 60 * 1000;

const ENV_GUARDIAN_KEY = import.meta.env.VITE_GUARDIAN_KEY as string | undefined;
const ENV_OPENAI_KEY   = import.meta.env.VITE_OPENAI_KEY   as string | undefined;

export default function App() {
  const [guardianKey, setGuardianKey] = useState(() => localStorage.getItem(STORAGE_KEY_GUARDIAN) || ENV_GUARDIAN_KEY || '');
  const [openaiKey,   setOpenaiKey]   = useState(() => localStorage.getItem(STORAGE_KEY_OPENAI)   || ENV_OPENAI_KEY   || '');
  const [isSetup, setIsSetup]         = useState(() => !!(localStorage.getItem(STORAGE_KEY_GUARDIAN) || ENV_GUARDIAN_KEY));

  const [articles,      setArticles]      = useState<Article[]>([]);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');
  const [activeSection, setActiveSection] = useState('all');
  const [chatOpen,      setChatOpen]      = useState(false);
  const [lastUpdated,   setLastUpdated]   = useState<Date | null>(null);

  const loadArticles = useCallback(async (section: string, key: string) => {
    if (!key) return;
    setLoading(true);
    setError('');
    try {
      const data = section === 'all'
        ? await fetchMultiSectionArticles(key)
        : await fetchArticles(section, key, 30);
      setArticles(data);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSetup || !guardianKey) return;
    loadArticles(activeSection, guardianKey);
    const interval = setInterval(() => loadArticles(activeSection, guardianKey), REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isSetup, activeSection, guardianKey, loadArticles]);

  function handleSetup(gKey: string, oKey: string) {
    localStorage.setItem(STORAGE_KEY_GUARDIAN, gKey);
    localStorage.setItem(STORAGE_KEY_OPENAI,   oKey);
    setGuardianKey(gKey);
    setOpenaiKey(oKey);
    setIsSetup(true);
  }

  if (!isSetup) {
    return <SetupModal onSave={handleSetup} />;
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a0f1e' }}>
      <Header
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        lastUpdated={lastUpdated}
        chatOpen={chatOpen}
        onChatToggle={() => setChatOpen(!chatOpen)}
      />

      <main
        className="max-w-screen-2xl mx-auto px-4 py-6 space-y-6 transition-all duration-300"
        style={{ paddingRight: chatOpen ? '25rem' : undefined }}
      >
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
            className="rounded-xl px-4 py-3 flex items-center gap-3">
            <p className="text-sm" style={{ color: '#fca5a5' }}>{error}</p>
            <button onClick={() => loadArticles(activeSection, guardianKey)}
              className="ml-auto text-xs underline" style={{ color: '#f87171' }}>Retry</button>
          </div>
        )}

        <MetricsBar articles={articles} loading={loading} />

        <div className="grid grid-cols-1 gap-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <NewsChart articles={articles} loading={loading} onSectionClick={setActiveSection} />
          </div>
          <div style={{ background: '#111827', border: '1px solid #1e293b' }} className="rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#fff' }}>Section Breakdown</h3>
            {loading ? (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-1">
                    <div className="skeleton h-3 w-20 rounded" />
                    <div className="skeleton h-1.5 w-full rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(
                  articles.reduce((acc, a) => {
                    acc[a.sectionName] = (acc[a.sectionName] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                )
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 8)
                  .map(([name, count]) => {
                    const pct = Math.round((count / articles.length) * 100);
                    return (
                      <div key={name} className="space-y-1">
                        <div className="flex items-center justify-between" style={{ fontSize: 12 }}>
                          <span style={{ color: '#94a3b8' }}>{name}</span>
                          <span style={{ color: '#64748b' }}>{count}</span>
                        </div>
                        <div className="rounded-full overflow-hidden" style={{ height: 4, background: '#1e293b' }}>
                          <div className="rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, height: '100%', background: 'rgba(96,165,250,0.6)' }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: '#fff' }}>
              {activeSection === 'all' ? 'Latest Headlines' : `${activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Headlines`}
              {!loading && <span className="ml-2 font-normal" style={{ color: '#475569', fontSize: 12 }}>{articles.length} articles</span>}
            </h2>
            <button onClick={() => loadArticles(activeSection, guardianKey)} disabled={loading}
              className="flex items-center gap-1.5 text-xs transition-colors"
              style={{ color: loading ? '#475569' : '#64748b' }}>
              <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
              {[...Array(12)].map((_, i) => (
                <div key={i} style={{ background: '#111827', border: '1px solid #1e293b' }} className="rounded-xl overflow-hidden">
                  <div className="skeleton" style={{ height: 160 }} />
                  <div className="p-4 space-y-2">
                    <div className="skeleton rounded" style={{ height: 12, width: '40%' }} />
                    <div className="skeleton rounded" style={{ height: 14, width: '100%' }} />
                    <div className="skeleton rounded" style={{ height: 14, width: '75%' }} />
                    <div className="skeleton rounded" style={{ height: 12, width: '90%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
              {articles.map((article, i) => (
                <HeadlineCard key={article.id} article={article} index={i} />
              ))}
            </div>
          )}

          {!loading && articles.length === 0 && !error && (
            <div className="text-center py-16" style={{ color: '#475569' }}>
              <p>No articles found. Try a different section.</p>
            </div>
          )}
        </div>
      </main>

      {chatOpen && (
        <div className="fixed inset-0 z-30 sm:hidden" style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setChatOpen(false)} />
      )}

      <ChatPanel articles={articles} openaiKey={openaiKey} isOpen={chatOpen} />
    </div>
  );
}
