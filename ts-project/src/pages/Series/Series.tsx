  import { useEffect, useMemo, useState } from "react";
  import { useQueryClient } from "@tanstack/react-query";
  import { useSeriesQuery } from "../../features/movies/useSeriesQuery";
  import { useMeQuery } from "../../features/auth/useMeQuery";
  import MovieCard from "../../components/common/MovieCard";
  import GenreSidebar from "../Movies/GenreSidebar";
  import "../Movies/movies.css";
  import { Movie } from "../../types/movie";
  import { SkeletonMovieCard } from "../../components/common/SkeletonMovieCard";

  type SeriesByGenre = Record<number, Movie[]>;

  export default function MoviesPage() {
    const { data: me } = useMeQuery();
    const isLoggedIn = !!me;
    
    const [selectedGenre, setSelectedGenre] = useState<number>(10759);
    const [pageByGenre, setPageByGenre] = useState<Record<number, number>>({10759: 1,});
    const [series, setSeries] =   useState<SeriesByGenre>({});
    const [excludeIds, setExcludeIds] = useState<Record<number, number[]>>({});
    const currentPage = pageByGenre[selectedGenre] ?? 1;
    const hasCachedSeries = (series[selectedGenre]?.length ?? 0) > 0;
    const { data, isFetching } = useSeriesQuery({
      genre: selectedGenre,
      page: currentPage,
      excludeIds:
        currentPage === 1 ? [] : excludeIds[selectedGenre] ?? [],
      enabled: !hasCachedSeries || currentPage > 1,
    });
    
    const selectedSeries = series[selectedGenre] ?? []
    /** yeni sayfa geldikçe ekle */
    console.log(selectedSeries)
    useEffect(() => {
      if (!data?.series) return;
        
      const currentPage = pageByGenre[selectedGenre] ?? 1;
      if (currentPage === 1 && hasCachedSeries) return;
      setSeries(prev => {
        // 🔥 page 1 ise sıfırdan başla
        const base = currentPage === 1 ? [] : (prev[selectedGenre] ?? []);
      
        const merged = [...base, ...data.series];
      
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
          ...(currentPage === 1 ? [] : prev[selectedGenre] ?? []),
          ...data.series.map(m => m.tmdbId),
        ],
      }));
    }, [data]);

  // useEffect(() => {
  //   window.scrollTo({ top: 0, left: 0 });
  // }, [isLoggedIn]);

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
    setSeries(prev => ({
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

    if ((selectedSeries.length ?? 0) < 8 && data?.hasMore) {
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
          type="series"
        />

        {/* SAĞ LİSTE */}
        <main className="movies-content">
          <h1 className="movies-title">Diziler</h1>

          <div className="movies-grid">
            
            {selectedSeries.map(movie => (
              <MovieCard
                key={movie.tmdbId}
                movie={movie}
                onDislike={handleDislike}
                canInteract={isLoggedIn}
                link="tv"
              />
            ))}
            {isFetching&& Array.from({ length: 10 }).map((_, i) => (
              <SkeletonMovieCard key={`sk-${i}`} />
            ))}
          </div>

          {data?.hasMore && (
            <div className="movies-load-more">
              <button
                disabled={isFetching}
                onClick={() => setPageByGenre(prev => ({
                                  ...prev,
                                  [selectedGenre]: (prev[selectedGenre] ?? 1) + 1,
                                }))}
              >
                {"Daha fazla"}
              </button>
            </div>
          )}
        </main>
      </div>
    );
  }
