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
