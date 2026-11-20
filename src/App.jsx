import { useEffect, useRef, useState } from "react";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// A self-contained placeholder poster (inline SVG, no network needed) so the
// list always looks right even without a TMDB key or a chosen poster.
function placeholderPoster(title) {
  const letter = (title.trim()[0] || "?").toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="92" height="92" viewBox="0 0 92 92"><rect width="92" height="92" rx="10" fill="#c7a6f5"/><text x="46" y="60" font-family="system-ui, sans-serif" font-size="46" font-weight="700" fill="#ffffff" text-anchor="middle">${letter}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function posterUrl(posterPath, title, size = "w92") {
  return posterPath
    ? `https://image.tmdb.org/t/p/${size}${posterPath}`
    : placeholderPoster(title);
}

function tmdbLink(movie) {
  return movie.tmdbId
    ? `https://www.themoviedb.org/movie/${movie.tmdbId}`
    : `https://www.themoviedb.org/search?query=${encodeURIComponent(movie.title)}`;
}

function Movie({ movie, onDelete, onToggleWatched }) {
  return (
    <li className={movie.watched ? "movie watched" : "movie"}>
      <button
        className="watch-toggle"
        onClick={() => onToggleWatched(movie.key)}
        aria-pressed={movie.watched}
        aria-label={
          movie.watched
            ? `Mark ${movie.title} as not watched`
            : `Mark ${movie.title} as watched`
        }
        title={movie.watched ? "Watched — click to unmark" : "Mark as watched"}
      >
        {movie.watched ? "✓" : ""}
      </button>
      <img
        className="movie-thumb"
        src={posterUrl(movie.posterPath, movie.title)}
        alt={movie.title}
        onError={(e) => {
          e.currentTarget.src = placeholderPoster(movie.title);
        }}
      />
      <span>
        <a
          className="movie-link"
          href={tmdbLink(movie)}
          target="_blank"
          rel="noopener noreferrer"
          title={`View ${movie.title} on TMDB`}
        >
          {movie.title}
        </a>
        {movie.year ? <small className="movie-year"> ({movie.year})</small> : null}
      </span>
      <button className="delete-btn" onClick={() => onDelete(movie.key)}>
        X
      </button>
    </li>
  );
}

function Candidate({ result, onPick }) {
  const year = (result.release_date || "").slice(0, 4);
  return (
    <button type="button" className="candidate" onClick={() => onPick(result)}>
      <img
        className="candidate-thumb"
        src={posterUrl(result.poster_path, result.title)}
        alt={result.title}
        onError={(e) => {
          e.currentTarget.src = placeholderPoster(result.title);
        }}
      />
      <span className="candidate-title">
        {result.title}
        {year ? <small className="candidate-year"> ({year})</small> : null}
      </span>
    </button>
  );
}

const BUTTERFLIES = [
  { top: "12%", duration: "24s", delay: "0s" },
  { top: "32%", duration: "30s", delay: "5s" },
  { top: "55%", duration: "26s", delay: "10s" },
  { top: "72%", duration: "33s", delay: "2s" },
  { top: "88%", duration: "28s", delay: "7s" },
];

function Butterfly({ top, duration, delay }) {
  return (
    <span
      className="butterfly"
      style={{
        top,
        animationDuration: duration,
        animationDelay: delay,
      }}
    >
      <svg viewBox="0 0 120 100" className="butterfly-svg">
        <g className="wing wing-left">
          <path
            className="wing-upper"
            d="M60,48 C46,20 20,10 12,22 C6,32 10,46 28,50 C40,53 52,52 60,48 Z"
          />
          <path
            className="wing-lower"
            d="M60,50 C48,66 26,78 18,70 C13,64 18,54 32,52 C42,50 52,50 60,50 Z"
          />
          <circle className="butterfly-spot" cx="22" cy="28" r="3" />
        </g>
        <g className="wing wing-right">
          <path
            className="wing-upper"
            d="M60,48 C74,20 100,10 108,22 C114,32 110,46 92,50 C80,53 68,52 60,48 Z"
          />
          <path
            className="wing-lower"
            d="M60,50 C72,66 94,78 102,70 C107,64 102,54 88,52 C78,50 68,50 60,50 Z"
          />
          <circle className="butterfly-spot" cx="98" cy="28" r="3" />
        </g>
        <path
          className="butterfly-antenna"
          d="M58,24 C54,16 50,10 46,6 M62,24 C66,16 70,10 74,6"
        />
        <ellipse className="butterfly-body" cx="60" cy="50" rx="3" ry="24" />
        <circle className="butterfly-body" cx="60" cy="27" r="4.5" />
      </svg>
    </span>
  );
}

function Butterflies() {
  return (
    <div className="butterflies" aria-hidden="true">
      {BUTTERFLIES.map((b, i) => (
        <Butterfly key={i} {...b} />
      ))}
    </div>
  );
}

let manualId = 0;

const STORAGE_KEY = "lauras-movies";

const DEFAULT_MOVIES = [
  { key: "tmdb-348", tmdbId: 348, title: "Alien", year: "1979", posterPath: "/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg", watched: false },
];

function loadMovies() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore unreadable/corrupt storage and fall back to defaults
  }
  return DEFAULT_MOVIES;
}

function App() {
  const [movies, setMovies] = useState(loadMovies);
  const [text, setText] = useState("");
  const [candidates, setCandidates] = useState(null); // null = no active search
  const [status, setStatus] = useState("idle"); // idle | searching | error
  const searchSeq = useRef(0);
  const [theme, setTheme] = useState(
    () =>
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"),
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
    } catch {
      // ignore storage write failures (e.g. private mode / quota)
    }
  }, [movies]);

  function toggleTheme() {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }

  function addExact(title) {
    const clean = title.trim();
    if (!clean) return;
    setMovies((prev) => [
      ...prev,
      { key: `manual-${Date.now()}-${manualId++}`, tmdbId: null, title: clean, year: "", posterPath: null, watched: false },
    ]);
    setText("");
    setCandidates(null);
    setStatus("idle");
  }

  async function searchMovies() {
    const query = text.trim();
    if (!query) return;

    // No key configured → can't search TMDB, just add the title as-is.
    if (!TMDB_API_KEY) {
      addExact(query);
      return;
    }

    const seq = ++searchSeq.current;
    setStatus("searching");
    setCandidates(null);
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
          query,
        )}`,
      );
      if (seq !== searchSeq.current) return; // a newer search superseded this one
      const data = res.ok ? await res.json() : null;
      const results = (data?.results ?? []).slice(0, 6);
      setCandidates(results);
      setStatus("idle");
    } catch {
      if (seq !== searchSeq.current) return;
      setStatus("error");
      setCandidates([]);
    }
  }

  function pickCandidate(result) {
    setMovies((prev) => [
      ...prev,
      {
        key: `tmdb-${result.id}`,
        tmdbId: result.id,
        title: result.title,
        year: (result.release_date || "").slice(0, 4),
        posterPath: result.poster_path ?? null,
        watched: false,
      },
    ]);
    setText("");
    setCandidates(null);
    setStatus("idle");
  }

  function cancelSearch() {
    searchSeq.current++;
    setCandidates(null);
    setStatus("idle");
  }

  function deleteMovie(key) {
    setMovies((prev) => prev.filter((m) => m.key !== key));
  }

  function toggleWatched(key) {
    setMovies((prev) =>
      prev.map((m) => (m.key === key ? { ...m, watched: !m.watched } : m)),
    );
  }

  return (
    <>
      <Butterflies />
      <div className="movie-app">
        <div className="movie-header">
          <h1>Laura's Movies</h1>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
        <form
          className="movie-form"
          onSubmit={(e) => {
            e.preventDefault();
            searchMovies();
          }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Search a movie..."
          />
          <button type="submit" disabled={status === "searching"}>
            {status === "searching" ? "…" : "Search"}
          </button>
        </form>

        {candidates !== null && (
          <div className="candidates">
            <div className="candidates-head">
              <span>
                {status === "error"
                  ? "Couldn't reach TMDB."
                  : candidates.length
                    ? "Pick the right movie:"
                    : "No matches found."}
              </span>
              <button
                type="button"
                className="candidates-close"
                onClick={cancelSearch}
              >
                X
              </button>
            </div>
            {candidates.map((result) => (
              <Candidate key={result.id} result={result} onPick={pickCandidate} />
            ))}
            {text.trim() && (
              <button
                type="button"
                className="candidate-plain"
                onClick={() => addExact(text)}
              >
                None of these — add “{text.trim()}” anyway
              </button>
            )}
          </div>
        )}

        <ul className="movie-list">
          {movies.map((m) => (
            <Movie
              key={m.key}
              movie={m}
              onDelete={deleteMovie}
              onToggleWatched={toggleWatched}
            />
          ))}
        </ul>
      </div>
    </>
  );
}

export default App;
