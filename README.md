# Laura's Movie

A small React + Vite app for keeping a personal movie list. Built while practicing React.

## Features

- Add and remove movies from your list
- Real movie poster thumbnails pulled from [TMDB](https://www.themoviedb.org/) (falls back to a placeholder image if a title isn't found)
- Light/dark theme toggle, saved across visits
- Animated purple butterflies drifting across the background

## Getting started

```bash
npm install
```

Create a `.env` file in the project root with a free [TMDB API key](https://www.themoviedb.org/settings/api):

```
VITE_TMDB_API_KEY=your_key_here
```

Then run the dev server:

```bash
npm run dev
```

## Scripts

- `npm run dev` — start the local dev server
- `npm run build` — build for production
- `npm run preview` — preview the production build
- `npm run lint` — run Oxlint
