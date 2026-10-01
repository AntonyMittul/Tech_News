# Signal // Tech Intelligence

An open-source technology news intelligence dashboard built with Next.js, TypeScript, PostgreSQL, and Drizzle ORM.

## Local development

Install dependencies:

```bash
npm install
```

Create the local environment file:

```bash
copy .env.example .env.local
```

Start PostgreSQL with Docker Desktop:

```bash
npm run db:up
```

Generate and apply the database migration, then seed the initial sources and categories:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

Fetch and persist Hacker News stories:

```bash
npm run ingest -- hacker-news
```

The other providers require their corresponding keys in `.env.local`:

```bash
npm run ingest -- guardian
npm run ingest -- gnews
npm run ingest -- rss
```

Classify existing stored articles and populate category/tag relations:

```bash
npm run classify
```

Enrich stored articles with Gemini 3.1 Flash-Lite:

```bash
npm run enrich
```

This requires a real `GEMINI_API_KEY` in `.env.local`. The command processes at most five articles by default; set `ENRICHMENT_LIMIT` to adjust the batch size. It never creates placeholder summaries when Gemini is unavailable.

For RSS, also set `RSS_FEED_URL`, `RSS_SOURCE_NAME`, and `RSS_SOURCE_URL`.

To preview a provider without writing to the database, open:

```text
http://localhost:3000/api/ingestion/preview?provider=hacker-news&limit=5
```

Start the application:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database commands

| Command | Purpose |
| --- | --- |
| `npm run db:up` | Start the local PostgreSQL container |
| `npm run db:down` | Stop the local PostgreSQL container |
| `npm run db:generate` | Generate a migration from the schema |
| `npm run db:migrate` | Apply migrations to PostgreSQL |
| `npm run db:seed` | Insert initial sources and categories |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run ingest -- hacker-news` | Fetch and persist provider articles |

The Docker database is exposed on port `5433` so it does not conflict with a PostgreSQL installation already using port `5432`.

## Quality checks

```bash
npm run lint
npm run build
npx tsc --noEmit
```

## Project structure

```text
src/app/       Next.js routes and UI
src/db/        Drizzle schema and database client
scripts/       Local maintenance and seed scripts
drizzle/       SQL migrations
```
