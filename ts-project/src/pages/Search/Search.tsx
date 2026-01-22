import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSearchQuery } from "../../features/movies/useSearchQuery";
import "./Search.css";

/* =========================
   Debounce Hook
========================= */
function useDebouncedValue<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const q = params.get("q") ?? "";
  const page = Number(params.get("page") ?? 1);

  // 🔹 input local state (URL’den beslenir)
  const [input, setInput] = useState(q);

  // 🔹 debounce edilmiş input
  const debouncedInput = useDebouncedValue(input, 350);

  // 🔹 URL sync (debounce sonrası)
  useEffect(() => {
    if (debouncedInput !== q) {
      setParams({ q: debouncedInput, page: "1" });
    }
  }, [debouncedInput]); // eslint-disable-line react-hooks/exhaustive-deps

  // 🔹 URL değişirse input’u güncelle (back/forward, refresh)
  useEffect(() => {
    setInput(q);
  }, [q]);

  // 🔹 Search query (URL = source of truth)
  const { data, isLoading, isFetching } = useSearchQuery({ q, page });
  const results = data?.results ?? [];

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setParams({ q: input, page: "1" });
  };

  return (
    <div className="search-page">
      <form className="search-form" onSubmit={onSubmit}>
        <input
          className="search-input"
          placeholder="Film veya dizi ara..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </form>

      {/* IDLE */}
      {!q && <div className="search-empty">Bir şey ara</div>}

      {/* LOADING (ilk yük) */}
      {isLoading && (
        <div className="search-results">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="search-item skeleton-search" />
          ))}
        </div>
      )}

      {/* RESULT */}
      {!isLoading && results.length > 0 && (
        <div className={`search-results ${isFetching ? "is-fetching" : ""}`}>
          {results.map((m: any) => (
            <div
              key={`${m.mediaType}-${m.tmdbId}`}
              className="search-item"
              onClick={() => navigate(`/${m.mediaType}/${m.tmdbId}`)}
            >
              <img
                src={
                  m.posterPath
                    ? `https://image.tmdb.org/t/p/w154${m.posterPath}`
                    : "/images/default-poster.png"
                }
                alt={m.title}
              />
              <div className="meta">
                <div className="title">{m.title}</div>
                <div className="year">{m.year}</div>
                {m.overview && <p className="overview">{m.overview}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EMPTY */}
      {!isLoading && q && results.length === 0 && (
        <div className="search-empty">Sonuç bulunamadı</div>
      )}
    </div>
  );
}
