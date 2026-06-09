export interface Article {
  id: string;
  webTitle: string;
  webUrl: string;
  webPublicationDate: string;
  sectionName: string;
  sectionId: string;
  pillarName?: string;
  fields?: {
    thumbnail?: string;
    headline?: string;
    trailText?: string;
    byline?: string;
  };
}

export interface GuardianResponse {
  response: {
    status: string;
    total: number;
    results: Article[];
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface SectionStat {
  name: string;
  count: number;
  color: string;
}

export type Section = {
  id: string;
  label: string;
  color: string;
};

export const SECTIONS: Section[] = [
  { id: 'all',         label: 'All',         color: '#60a5fa' },
  { id: 'world',       label: 'World',       color: '#34d399' },
  { id: 'business',    label: 'Business',    color: '#f59e0b' },
  { id: 'technology',  label: 'Technology',  color: '#a78bfa' },
  { id: 'sport',       label: 'Sport',       color: '#fb7185' },
  { id: 'politics',    label: 'Politics',    color: '#38bdf8' },
  { id: 'science',     label: 'Science',     color: '#4ade80' },
  { id: 'culture',     label: 'Culture',     color: '#fbbf24' },
];
