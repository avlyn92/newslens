import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import type { Article } from '../types';
import { SECTIONS } from '../types';

interface NewsChartProps {
  articles: Article[];
  loading: boolean;
  onSectionClick: (sectionId: string) => void;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { name: string; color: string } }>;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const { value, payload: { name, color } } = payload[0];
  return (
    <div className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-slate-400 mb-0.5">{name}</p>
      <p className="text-sm font-semibold" style={{ color }}>{value} articles</p>
    </div>
  );
}

export default function NewsChart({ articles, loading, onSectionClick }: NewsChartProps) {
  const data = SECTIONS.filter(s => s.id !== 'all').map(s => {
    const count = articles.filter(
      a => a.sectionId === s.id || a.sectionName.toLowerCase() === s.label.toLowerCase()
    ).length;
    return { name: s.label, count, color: s.color, id: s.id };
  }).filter(d => d.count > 0);

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Coverage by Section</h3>
          <p className="text-xs text-slate-500 mt-0.5">Click a bar to filter</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span className="text-xs text-slate-500">Live data</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-end gap-2 h-40 px-4">
          {[65, 45, 80, 30, 55, 40, 70].map((h, i) => (
            <div key={i} className="skeleton flex-1 rounded-t" style={{ height: `${h}%` }} />
          ))}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
            onClick={(e) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const payload = (e as any)?.activePayload?.[0]?.payload;
              if (payload?.id) onSectionClick(payload.id);
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff08' }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} cursor="pointer">
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
