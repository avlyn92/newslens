import type { Article, GuardianResponse, ChatMessage } from './types'; import { SECTIONS } from './types';

const GUARDIAN_API = 'https://content.guardianapis.com';

// --- Guardian News API ---

export async function fetchArticles(
  sectionId: string,
  apiKey: string,
  pageSize = 30
): Promise<Article[]> {
  const params = new URLSearchParams({
    'api-key': apiKey,
    'page-size': String(pageSize),
    'show-fields': 'thumbnail,headline,trailText,byline',
    'order-by': 'newest',
  });

  if (sectionId !== 'all') {
    params.set('section', sectionId);
  }

  const res = await fetch(`${GUARDIAN_API}/search?${params}`);
  if (!res.ok) throw new Error(`Guardian API error: ${res.status}`);
  const data: GuardianResponse = await res.json();
  return data.response.results;
}

export async function fetchMultiSectionArticles(apiKey: string): Promise<Article[]> {
  // Fetch several sections in parallel to build the overview
  const sections = SECTIONS.filter(s => s.id !== 'all').map(s => s.id);
  const results = await Promise.allSettled(
    sections.map(s =>
      fetchArticles(s, apiKey, 10)
    )
  );

  const articles: Article[] = [];
  results.forEach(r => {
    if (r.status === 'fulfilled') articles.push(...r.value);
  });

  // Deduplicate by id and sort by date
  const seen = new Set<string>();
  return articles
    .filter(a => { if (seen.has(a.id)) return false; seen.add(a.id); return true; })
    .sort((a, b) => new Date(b.webPublicationDate).getTime() - new Date(a.webPublicationDate).getTime());
}

// --- OpenAI Chat API ---

export async function streamChatResponse(
  messages: ChatMessage[],
  articles: Article[],
  apiKey: string,
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (err: string) => void
): Promise<void> {
  // Build news context summary for the AI
  const newsContext = articles
    .slice(0, 40)
    .map(a => `[${a.sectionName}] ${a.webTitle}${a.fields?.trailText ? ' — ' + a.fields.trailText.replace(/<[^>]+>/g, '') : ''}`)
    .join('\n');

  const systemPrompt = `You are NewsLens AI, an intelligent news analytics assistant.
You help users understand today's top news stories from The Guardian.
Be concise, insightful, and analytical — think of yourself as a smart analyst summarizing news trends.
When referencing articles, cite the section name. Use bullet points for lists.

CURRENT NEWS CONTEXT (${articles.length} live articles from The Guardian):
${newsContext}

Today's date: ${new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;

  const openaiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({ role: m.role, content: m.content })),
  ];

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: openaiMessages,
        stream: true,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      onError(err.error?.message || 'OpenAI API error');
      return;
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const lines = decoder.decode(value).split('\n');
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') { onDone(); return; }
        try {
          const parsed = JSON.parse(data);
          const chunk = parsed.choices?.[0]?.delta?.content;
          if (chunk) onChunk(chunk);
        } catch {
          // skip malformed chunks
        }
      }
    }
    onDone();
  } catch (err) {
    onError(err instanceof Error ? err.message : 'Network error');
  }
}
