# Openpedia Client

A Wikipedia reader built with Next.js. Search articles, open a random page, browse in different languages, and inspect revision history.

## What it does

- Search Wikipedia and open articles at `/wiki/[title]`.
- Choose from 11 supported Wikipedia languages.
- Browse article sections and follow internal links.
- View revision history and compare revisions.
- Switch between light and dark themes.

## Run locally

Use Node.js 20.9+ and npm.

```bash
git clone https://github.com/SpyC0der77/openpedia-client.git
cd openpedia-client
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000).

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build the production app |
| `npm run start` | Serve a production build |
| `npm run lint` | Run ESLint |

Run `build` before `start`.

## Dependencies and limitations

The server fetches content from Wikipedia APIs. No API key is required, but article loading, search, and history need network access to Wikipedia. Wikipedia content is subject to its upstream attribution and licensing requirements.

## Source layout

- [`lib/wikipedia.ts`](lib/wikipedia.ts): Wikipedia APIs and language support.
- [`components/wiki-article-view.tsx`](components/wiki-article-view.tsx): Article reader.
- [`components/wiki-history.tsx`](components/wiki-history.tsx): Revision history.
- [`app/wiki/[title]/compare/page.tsx`](app/wiki/[title]/compare/page.tsx): Revision comparison.
