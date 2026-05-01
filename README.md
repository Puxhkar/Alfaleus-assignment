# 📰 News Digest Platform

A **Multi-Source AI-Powered News Intelligence** platform that aggregates, summarizes, and clusters news from multiple sources in real-time.

![Tech Stack](https://img.shields.io/badge/React-19-blue?logo=react) ![Node](https://img.shields.io/badge/Node.js-18+-green?logo=node.js) ![Groq](https://img.shields.io/badge/Groq_AI-Llama_3-orange?logo=meta)

---

## 🔗 Live Deliverables

- **Frontend Demo**: [https://alfaleus-assignment.vercel.app/](https://alfaleus-assignment.vercel.app/)
- **API Base URL**: [https://alfaleus-assignment.onrender.com/api](https://alfaleus-assignment.onrender.com/api)
- **Interactive Documentation**: [https://alfaleus-assignment.onrender.com/api/docs](https://alfaleus-assignment.onrender.com/api/docs)
- **Postman Collection**: [Download JSON](./postman_collection.json) (Import this file into Postman)

---

## ✨ Features

- ✅ **Multi-source news aggregation** — NewsAPI.org + BBC/TechCrunch RSS
- ✅ **AI-generated 2-line summaries** — Powered by Claude API (claude-sonnet-4-20250514)
- ✅ **Smart topic clustering** — Articles grouped by shared topic tags
- ✅ **Sentiment analysis** — Positive / Neutral / Negative per article
- ✅ **REST API with auth + rate limiting** — API key header + 60 req/min
- ✅ **Topic subscriptions** — Email-based topic subscriptions
- ✅ **OpenAPI documentation** — Full Swagger/OpenAPI 3.0 spec
- ✅ **Auto-refresh every 30 minutes** — Background cron scheduling
- ✅ **Dark editorial UI** — Premium design inspired by The Economist meets tech
- ✅ **Real-time search & filtering** — By topic, sentiment, and keywords
- ✅ **Skeleton loading states** — Animated placeholders during data fetch
- ✅ **Mobile responsive** — Single-column on mobile, multi-column on desktop

---

## 🏗 Architecture

```
┌─────────────┐     ┌────────────────┐     ┌────────────┐
│  NewsAPI.org │────▶│                │     │  Claude AI  │
│  (5 cats)    │     │  Node/Express  │────▶│  Summaries  │
├─────────────┤     │    Backend     │     │  Sentiment  │
│  BBC RSS     │────▶│   (port 5000)  │     │  Topics     │
│  TechCrunch  │     │                │     └────────────┘
└─────────────┘     └───────┬────────┘
                            │ /api/digest
                    ┌───────▼────────┐
                    │  React Frontend │
                    │   (port 3000)   │
                    └────────────────┘
```

---

## 🚀 Setup

### Prerequisites
- **Node.js 18+** (with npm)
- **NewsAPI key** — Free at [newsapi.org](https://newsapi.org)
- **Anthropic API key** — From [console.anthropic.com](https://console.anthropic.com)

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in your API keys
npm run dev             # or: npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:3000` and proxies API calls to the backend at `http://localhost:5000`.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/digest` | Get all clustered news |
| `GET`  | `/api/digest?sentiment=positive` | Filter by sentiment |
| `GET`  | `/api/digest?limit=10` | Limit clusters |
| `GET`  | `/api/topic/:name` | Get clusters by topic |
| `GET`  | `/api/topics` | List all available topics |
| `POST` | `/api/subscribe` | Subscribe to topics |
| `GET`  | `/api/subscriptions/:email` | Get subscriptions |
| `GET`  | `/api/health` | Health check |
| `GET`  | `/api/docs` | OpenAPI spec |

---

## 🔐 Authentication

All endpoints (except `/api/health` and `/api/docs`) require an API key header:

```
X-API-Key: digest-secret-key-2024
```

---

## ⚡ Rate Limiting

- **60 requests per minute** per IP address
- Returns `429 Too Many Requests` on exceed
- Counter resets every 60 seconds

---

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| Charcoal | `#0f0f13` | Background |
| Surface | `#16161d` | Cards |
| Accent | `#f5c518` | Electric yellow — CTAs, active states |
| Off-white | `#f0ede8` | Primary text |
| Positive | `#27ae60` | Positive sentiment |
| Negative | `#e74c3c` | Negative sentiment |

**Typography:**
- Headlines: *Playfair Display* (serif)
- Body: *IBM Plex Sans* (sans-serif)

---

## 📁 Project Structure

```
├── backend/
│   ├── server.js              # Express entry point
│   ├── routes/
│   │   ├── digest.js          # GET /api/digest
│   │   ├── topic.js           # GET /api/topic/:name, /api/topics
│   │   ├── subscribe.js       # POST /api/subscribe
│   │   └── docs.js            # GET /api/docs (OpenAPI)
│   ├── services/
│   │   ├── newsFetcher.js     # NewsAPI + RSS aggregation
│   │   ├── summarizer.js      # Claude AI summaries + sentiment
│   │   ├── clusterer.js       # Topic-based clustering
│   │   └── scheduler.js       # node-cron (every 30 min)
│   ├── middleware/
│   │   ├── apiKey.js          # API key auth
│   │   └── rateLimiter.js     # 60 req/min per IP
│   ├── store/
│   │   └── newsStore.js       # In-memory store
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── TopicFilter.jsx
│   │   │   ├── NewsCluster.jsx
│   │   │   ├── ArticleCard.jsx
│   │   │   ├── SentimentBadge.jsx
│   │   │   ├── SubscribeModal.jsx
│   │   │   └── LoadingSkeleton.jsx
│   │   └── services/
│   │       └── api.js
│   └── index.html
├── README.md
└── openapi.yaml
```

---

## 📝 License

MIT
