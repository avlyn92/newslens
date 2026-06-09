import type { Article, SectionStat } from '../types';
import { SECTIONS } from '../types';

interface MetricsBarProps {
  articles: Article[];
  loading: boolean;
}

function getSectionStats(articles: Article[]): SectionStat[] {
  const counts: Record<string, number> = {};
  articles.forEach(a => {
    const key = a.sectionName || 'Other';
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => {
      const section = SECTIONS.find(s => s.label.toLowerCase() === name.toLowerCase());
      return { name, count, color: section?.color || '#60a5fa' };
    });
}

function getTopSource(articles: Article[]): string {
  const sectionStats = getSectionStats(articles);
  return sectionStats[0]?.name || '—';
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

function StatCard({ label, value, sub, icon, color, loading }: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 flex items-center gap-4">
        <div className="skeleton w-10 h-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3 w-20 rounded" />
          <div className="skeleton h-6 w-16 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 flex items-center gap-4 hover:border-slate-700 transition-colors">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: color + '22' }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-xl font-bold text-white truncate">{value}</p>
        {sub && <p className="text-xs text-slate-500 truncate">{sub}</p>}
      </div>
    </div>
  );
}

export default function MetricsBar({ articles, loading }: MetricsBarProps) {
  const topSection = getTopSource(articles);
  const uniqueSections = new Set(articles.map(a => a.sectionName)).size;
  const latestTime = articles[0]
    ? new Date(articles[0].webPublicationDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '—';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        label="Total Articles"
        value={loading ? '—' : articles.length}
        sub="from The Guardian"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        }
        color="#60a5fa"
        loading={loading}
      />
      <StatCard
        label="Top Section"
        value={loading ? '—' : topSection}
        sub="most coverage"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        }
        color="#f59e0b"
        loading={loading}
      />
      <StatCard
        label="Sections Covered"
        value={loading ? '—' : uniqueSections}
        sub="categories tracked"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        }
        color="#a78bfa"
        loading={loading}
      />
      <StatCard
        label="Latest Story"
        value={loading ? '—' : latestTime}
        sub="most recent update"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        color="#34d399"
        loading={loading}
      />
    </div>
  );
}
