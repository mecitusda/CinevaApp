import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useMoviesQuery } from "../../features/movies/useMoviesQuery";
import { useMeQuery } from "../../features/auth/useMeQuery";
import MovieCard from "../../components/common/MovieCard";
import GenreSidebar from "./GenreSidebar";
import "./movies.css";
import { Movie } from "../../types/movie";
import { SkeletonMovieCard } from "../../components/common/SkeletonMovieCard";

type MoviesByGenre = Record<number, Movie[]>;

export default function MoviesPage() {
  const { data: me } = useMeQuery();
  const isLoggedIn = !!me;

  const [selectedGenre, setSelectedGenre] = useState<number>(28);
  const [pageByGenre, setPageByGenre] = useState<Record<number, number>>({28: 1,});
  const [movies, setMovies] =   useState<MoviesByGenre>({});
  const [excludeIds, setExcludeIds] = useState<Record<number, number[]>>({});
  const currentPage = pageByGenre[selectedGenre] ?? 1;
  const hasCachedMovies = (movies[selectedGenre]?.length ?? 0) > 0;
  
  const { data, isFetching } = useMoviesQuery({
    genre: selectedGenre,
    page: currentPage,
    excludeIds:
      currentPage === 1 ? [] : excludeIds[selectedGenre] ?? [],
    enabled: !hasCachedMovies || currentPage > 1,
  });
  console.log("cachete var mı: ",hasCachedMovies,isFetching)
  const selectedMovies = movies[selectedGenre] ?? []
  
  /** yeni sayfa geldikçe ekle */
  useEffect(() => {
    if (!data?.movies) return;
    if (data.genre !== selectedGenre) return;
    if (currentPage === 1 && hasCachedMovies) return;
    setMovies((prev) => {
      const prevMovies = prev[selectedGenre] ?? [];
    const merged = [...prevMovies, ...data.movies];

    return {
      ...prev,
      [selectedGenre]: merged.filter(
        (m, i, arr) =>
          arr.findIndex(x => x.tmdbId === m.tmdbId) === i
      ),
    };
    });

    setExcludeIds(prev => ({
       ...prev,
       [selectedGenre]: [
         ...(prev[selectedGenre] ?? []),
         ...data.movies.map(m => m.tmdbId),
       ],
     }));

  }, [data, selectedGenre]);

  /** genre değişince reset */
 function handleGenreChange(genreId: number) {
  setSelectedGenre(genreId);

  setPageByGenre(prev => ({
    ...prev,
    [genreId]: prev[genreId] ?? 1,
  }));
 }

  /** dislike */
  function handleDislike(movie: Movie) {
  setMovies(prev => ({
    ...prev,
    [selectedGenre]: (prev[selectedGenre] ?? []).filter(
      m => m.tmdbId !== movie.tmdbId
    ),
  }));

  setExcludeIds(prev => ({
    ...prev,
    [selectedGenre]: [
      ...(prev[selectedGenre] ?? []),
      movie.tmdbId,
    ],
  }));

  if ((selectedMovies.length ?? 0) < 8 && data?.hasMore) {
    setPageByGenre(prev => ({
      ...prev,
      [selectedGenre]: (prev[selectedGenre] ?? 1) + 1,
    }));
  }
  }


  return (
    <div className="movies-layout">
      {/* SOL BAR */}
      <GenreSidebar
        selected={selectedGenre}
        onSelect={handleGenreChange}
        type="movies"
      />

      {/* SAĞ LİSTE */}
      <main className="movies-content">
        <h1 className="movies-title">Filmler</h1>

        <div className="movies-grid">
          
          {selectedMovies.map(movie => (
            <MovieCard
              key={movie.tmdbId}
              movie={movie}
              onDislike={handleDislike}
              canInteract={isLoggedIn}
              link="movie"
            />
          ))}
        {isFetching && Array.from({ length: 10 }).map((_, i) => (
          <SkeletonMovieCard key={`sk-${i}`} />
        ))}
        </div>

        {data?.hasMore && !isFetching && (
          <div className="movies-load-more">
            <button
              disabled={isFetching}
              onClick={() => setPageByGenre(prev => ({
                                ...prev,
                                [selectedGenre]: (prev[selectedGenre] ?? 1) + 1,
                              }))}
            >
              {"Daha Fazla"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
