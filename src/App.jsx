import { useEffect, useState } from "react";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

function Movie({ title, onDelete, posterPath }) {
  const imageUrl = posterPath
    ? `https://image.tmdb.org/t/p/w92${posterPath}`
    : `https://picsum.photos/seed/${encodeURIComponent(title)}/40`;

  return (
    <li className="movie">
      <img className="movie-thumb" src={imageUrl} alt={title} />
      <span>{title}</span>
      <button className="delete-btn" onClick={() => onDelete(title)}>
        X
      </button>
    </li>
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

function App() {
  const [movies, setMovies] = useState(["Alien"]);
  const [text, setText] = useState("");
  const [posters, setPosters] = useState({});
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

  function toggleTheme() {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }

  useEffect(() => {
    movies.forEach((title) => {
      if (title in posters) return;
      fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
          title,
        )}`,
      )
        .then((res) => res.json())
        .then((data) => {
          const posterPath = data.results?.[0]?.poster_path ?? null;
          setPosters((prev) => ({ ...prev, [title]: posterPath }));
        })
        .catch(() => setPosters((prev) => ({ ...prev, [title]: null })));
    });
  }, [movies, posters]);

  function addMovie() {
    setMovies([...movies, text]);
    setText("");
  }

  function deleteMovie(title) {
    setMovies(movies.filter((m) => m !== title));
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
        <div className="movie-form">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a movie..."
          />
          <button onClick={addMovie}>Add</button>
        </div>
        <ul className="movie-list">
          {movies.map((m) => (
            <Movie
              key={m}
              title={m}
              onDelete={deleteMovie}
              posterPath={posters[m]}
            />
          ))}
        </ul>
      </div>
    </>
  );
}

export default App;
