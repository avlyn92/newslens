# NewsLens — AI-Powered News Analytics Dashboard

A real-time news analytics dashboard built with React + TypeScript, powered by The Guardian's live API and GPT-4o-mini for natural language chat.

**Built to demonstrate:** data visualization, AI chat integration, real-time data fetching, component architecture, and mobile-responsive design.

---

## Features

- **Live news data** from The Guardian Open Platform (real-time, multiple sections)
- **Interactive charts** — bar chart showing coverage by section, clickable to filter
- **AI chat** — ask "What's happening in tech?" and get GPT-powered answers grounded in today's headlines (streaming)
- **Smart metrics** — total articles, top section, sections covered, latest timestamp
- **Mobile responsive** — chat panel slides in, grid adapts
- **Auto-refresh** every 5 minutes with skeleton loading states

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript (Vite) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| News data | The Guardian Content API |
| AI chat | OpenAI gpt-4o-mini (streaming) |
| Date utils | date-fns |

---

## Setup (5 minutes)

### 1. Get a free Guardian API key
Register at https://open-platform.theguardian.com/access/ — key arrives by email instantly.

### 2. Get an OpenAI API key (optional — for AI chat)
Go to https://platform.openai.com/api-keys. Uses `gpt-4o-mini` (~$0.001 per message).

### 3. Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173. Paste your API keys in the setup screen — they're saved to localStorage only.

### 4. Deploy to Vercel (free)

```bash
npm run build
npx vercel
```

> For production: move OpenAI calls to a Vercel API route to protect your key. The Guardian key is safe client-side.

---

## Project Structure

```
src/
├── App.tsx              # Root — state, layout, data orchestration
├── api.ts               # Guardian API + OpenAI streaming
├── types.ts             # Shared TypeScript interfaces + section config
├── components/
│   ├── Header.tsx       # Nav + section tabs + AI chat toggle
│   ├── MetricsBar.tsx   # 4 stat cards with skeleton states
│   ├── NewsChart.tsx    # Recharts bar chart (clickable to filter)
│   ├── HeadlineCard.tsx # Article card with image, time, section badge
│   ├── ChatPanel.tsx    # Sliding AI chat panel with streaming
│   └── SetupModal.tsx   # First-run API key entry screen
```
