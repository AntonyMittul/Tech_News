# ByteBrief (Tech Intelligence Feed)

ByteBrief is a curated intelligence dashboard that aggregates real technology news from configured sources and stores them locally for a focused, distraction-free reading experience. It uses AI to classify and enrich news feeds, filtering out low-quality "noise".

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (Neon for production) + Drizzle ORM
- **Styling**: Tailwind CSS v4
- **AI Processing**: Google Gemini 3.1 Flash-Lite
- **Testing**: Playwright (E2E) & Vitest (Unit)

## Features
- **Live Feed Dashboard**: View categorized, high-quality technology news.
- **Glassmorphic Cyberpunk Theme**: Beautiful dark and light modes with custom gradients and micro-animations.
- **Automated AI Ingestion**: Fetches RSS feeds and uses Gemini to filter out noise, write succinct summaries, and extract key points.
- **Local Bookmarking**: Save your favorite articles locally in your browser.

## Local Setup

### 1. Prerequisites
- Node.js v20+
- Docker Desktop (for local Postgres database)
- Gemini API Key

### 2. Environment Variables
Create a `.env.local` file in the root directory:
```env
DATABASE_URL="postgresql://signal:signal@localhost:5433/tech_news"
GEMINI_API_KEY="your-gemini-api-key"
CRON_SECRET="your-secure-random-string"
```

### 3. Running with Docker (Recommended)
To run the entire application (Database + Frontend) exactly the same way it runs in production, use Docker Compose:
```bash
docker-compose up --build
```
The app will be available at `http://localhost:3000`.

### 4. Running Locally (Without Dockerizing the Frontend)
If you prefer to run the Node server on your host machine for development:
```bash
# Start only the Postgres instance
npm run db:up

# Start the Next.js dev server
npm run dev
```

### 5. Database Initialization (First Time Setup)
If this is your first time starting the database, run these commands to set up the tables and initial seed data:
```bash
npm run db:migrate
npm run db:seed
```

### 6. Fetching the Initial Data
To populate the database with the latest articles:
```bash
# Fetch raw articles from Hacker News (or other providers)
npm run ingest -- hacker-news

# Classify and enrich the articles using Gemini AI
npm run classify
npm run enrich
```

### 5. Running the App
```bash
npm run dev
```
Open `http://localhost:3000` to view your live feed!

## Testing
- **Unit & API Tests**: `npm run test`
- **End-to-End Tests**: `npm run test:e2e` (Requires Playwright browsers)

## Automated Refresh
The application features a cron endpoint (`/api/cron/refresh`) configured in `vercel.json` to automatically fetch, classify, and enrich new articles every day at midnight (UTC).
