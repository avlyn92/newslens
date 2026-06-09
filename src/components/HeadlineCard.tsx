import type { Article } from '../types';
import { SECTIONS } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface HeadlineCardProps {
  article: Article;
  index: number;
}

export default function HeadlineCard({ article, index }: HeadlineCardProps) {
  const section = SECTIONS.find(
    s => s.id === article.sectionId || s.label.toLowerCase() === article.sectionName.toLowerCase()
  );
  const color = section?.color || '#60a5fa';

  const timeAgo = formatDistanceToNow(new Date(article.webPublicationDate), { addSuffix: true });
  const trailText = article.fields?.trailText?.replace(/<[^>]+>/g, '') || '';

  return (
    <a
      href={article.webUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-[#111827] border border-slate-800 rounded-xl overflow-hidden hover:border-slate-600 transition-all duration-200 hover:shadow-lg hover:shadow-black/30 hover:-translate-y-0.5"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {article.fields?.thumbnail && (
        <div className="relative h-40 overflow-hidden bg-slate-900">
          <img
            src={article.fields.thumbnail}
            alt={article.webTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent opacity-60" />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-xs font-medium px-2 py-0.5 rounded"
            style={{ backgroundColor: color + '22', color }}
          >
            {article.sectionName}
          </span>
          <span className="text-xs text-slate-600">{timeAgo}</span>
        </div>

        <h3 className="text-sm font-semibold text-slate-100 leading-snug mb-2 group-hover:text-white transition-colors line-clamp-3">
          {article.webTitle}
        </h3>

        {trailText && (
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
            {trailText}
          </p>
        )}

        {article.fields?.byline && (
          <p className="text-xs text-slate-600 mt-2 truncate">
            by {article.fields.byline}
          </p>
        )}
      </div>
    </a>
  );
}
