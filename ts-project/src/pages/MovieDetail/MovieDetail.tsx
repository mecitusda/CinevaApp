import { useParams } from 'react-router-dom';
import { useMovieDetailQuery } from '../../features/movies/useMovieDetailQuery';
import './MovieDetails.css';
import { Rating } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';

import { Heart, BookMarked } from "lucide-react";
import { useMeQuery } from "../../features/auth/useMeQuery";
import { addFollowing, removeFollowing, getSimilarMovies } from "../../api/movies.api";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { dislikeMovie, likeItem, logView, unlikeItem} from "../../api/activity.api";
import toast from "react-hot-toast";
import { HomeResponse } from "../../features/movies/useHomeQuery"
import MovieDetailsSkeleton from './MovieDetail-Skeleton';
import MovieRow from '../../components/layout/MovieRow';
import { useSimilarMoviesQuery } from '../../features/movies/useSimilarMoviesQuery';
import { Movie } from '../../types/movie';
import { useTrailerQuery } from "../../features/movies/useMovieTrailerQuery";
import PersonModal from '../../components/common/PersonModal';
import {Particle} from "../../types/Particle"
const SIMILAR_MIN_COUNT = Math.ceil(window.innerWidth / 230)+2;

export const TMDB_GENRES: Record<number, string> = {
  28: "#b91c1c",
  12: "#0f766e",
  16: "#7c3aed",
  35: "#f59e0b",
  80: "#334155",
  99: "#475569",
  18: "#1e293b",
  10751: "#059669",
  14: "#6d28d9",
  36: "#7c2d12",
  27: "#111827",
  10402: "#db2777",
  9648: "#0f172a",
  10749: "#be185d",
  878: "#0369a1",
  10770: "#4b5563",
  53: "#1f2933",
  10752: "#3f3f46",
  37: "#92400e",
};


export default function MovieDetails() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: movieDetail, isLoading, error } = useMovieDetailQuery(Number(id));
  const {
  data: similarData,
  isLoading: similarLoading,
  } = useSimilarMoviesQuery(movieDetail?.movie?.tmdbId);
  const { data: me } = useMeQuery();  

  const loggedRef = useRef(false);
  const loadingMoreRef = useRef(false);
  const particleIdRef = useRef(0);
  const castRowRef = useRef<HTMLDivElement | null>(null);
  const directorRowRef = useRef<HTMLDivElement | null>(null)
  const isLoggedIn = !!me;
 
  console.log(movieDetail?.movie.tmdbId)
  const isFavorite = me?.favorites?.some(
    (f: { tmdbId: number; mediaType: "movie" | "tv" }) =>
    f.tmdbId === movieDetail?.movie?.tmdbId && f.mediaType === "movie" ) ?? false;
  const isFollowing = me?.following?.some(
    (f: { tmdbId: number; mediaType: "movie" | "tv" }) =>
    f.tmdbId === movieDetail?.movie.tmdbId && f.mediaType === "movie"
    ) ?? false;
  const [trailerOpen, setTrailerOpen] = useState(false);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [canScrollLeftDirector, setCanScrollLeftDirector] = useState(false);
  const [canScrollRightDirector, setCanScrollRightDirector] = useState(true);
 
  const [loading, setLoading] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isDisliked, setIsDisliked] = useState(false);
  const [similarLoadingMore, setSimilarLoadingMore] = useState(false);
  const [similarState, setSimilarState] = useState<{
    movies: Movie[];
    page: number;
    hasMore: boolean;
    loading: boolean;
  }>({
    movies: [],
    page: 1,
    hasMore: true,
    loading: true,
  });
  const { data: trailerKey } = useTrailerQuery(
  movieDetail?.movie?.tmdbId
  );
   const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
  function openPersonModal(id: number) {
    setSelectedPersonId(id);
  }

  function closePersonModal() {
    setSelectedPersonId(null);
  }
  useEffect(() => {
  if (!similarData) return;

  setSimilarState({
    movies: similarData.movies,
    page: similarData.page ?? 1,
    hasMore: similarData.hasMore ?? false,
    loading: false,
  });
}, [similarData]);
  console.log(movieDetail?.directors)
  const handleDislike = async () => {
    if (!me) return;
    if(!movieDetail) return;
    try {
      await dislikeMovie({
      tmdbId: movieDetail?.movie?.tmdbId,
      mediaType: "movie",
      genreIds: movieDetail?.movie?.genres?.map(g => g.id),
      });

      setIsDisliked(true);
      if(!isDisliked){
      toast("Geri bildiriminiz alındı. Artık bu tarz filmler daha az gösterilicek.")
      }

      queryClient.setQueryData<HomeResponse>(
        ['home', isLoggedIn],
      (old) => {
        if (!old) return old;

        return {
          ...old,
          trending: {
            ...old.trending,
            movies: old.trending.movies.filter(
              m => m.tmdbId !== movieDetail?.movie.tmdbId
            ),
          },
          discovery: {
            ...old.discovery,
            movies: old.discovery.movies.filter(
                m => m.tmdbId !== movieDetail?.movie.tmdbId
              ),
            },
            recommended: old.recommended
              ? {
                  ...old.recommended,
                  movies: old.recommended.movies.filter(
                    m => m.tmdbId !== movieDetail?.movie.tmdbId
                  ),
                }
              : null,
          };
        }
      );

    } catch (err) {
      console.error("Dislike failed", err);
    }
  };

  function scrollRow(
  ref: React.RefObject<HTMLDivElement | null>,
  dir: "left" | "right"
) {
  const el = ref.current;
  if (!el) return;

  el.scrollBy({
    left: dir === "left" ? -900 : 900,
    behavior: "smooth",
  });
}



  function updateScrollButtons(
  ref: React.RefObject<HTMLDivElement | null>,
  setLeft: (v: boolean) => void,
  setRight: (v: boolean) => void
) {
  const el = ref.current;
  if (!el) {
    setLeft(false);
    setRight(false);
    return;
  }

  const hasOverflow = el.scrollWidth > el.clientWidth + 1;

  if (!hasOverflow) {
    setLeft(false);
    setRight(false);
    return;
  }

  setLeft(el.scrollLeft > 0);
  setRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
}


  async function loadMoreSimilar() {
    if (loadingMoreRef.current) return;
    if (!similarState.hasMore) return;
    if (!movieDetail) return;
    loadingMoreRef.current = true;
    setSimilarLoadingMore(true);

    try {
    const excludeIds = similarState?.movies?.map(m => m.tmdbId);

    const data = await getSimilarMovies({
      movieId: movieDetail.movie.tmdbId,
      page: similarState.page + 1,
      excludeIds,
      limit: 20,
    });

    if (!data.movies.length) {
      setSimilarState(prev => ({
        ...prev,
        hasMore: false,
      }));
      return;
    }

    setSimilarState(prev => ({
      ...prev,
      movies: [
        ...prev.movies,
        ...data.movies.filter(
          (m: Movie) =>
            !prev.movies.some(p => p.tmdbId === m.tmdbId)
        ),
      ],
      page: data.page,
      hasMore: data.hasMore,
    }));
    } finally {
      loadingMoreRef.current = false;
      setSimilarLoadingMore(false);
    }
}


  
  /* =========================
     PARTICLES (AYNI KOD)
  ========================= */
  const createParticles = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const newParticles: Particle[] = [];
    for (let i = 0; i < 6; i++) {
      newParticles.push({
        id: particleIdRef.current++,
        x: centerX,
        y: centerY,
      });
    }

    setParticles(prev => [...prev, ...newParticles]);

    setTimeout(() => {
      setParticles(prev =>
        prev.filter(p => !newParticles.find(np => np.id === p.id))
      );
    }, 600);
  };

  const handleToggleFavorite = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!me) return;
    if(!movieDetail) return;
    createParticles(e);
    setLoading(true);
    try {
      if (isFavorite) {
        await unlikeItem(movieDetail?.movie.tmdbId,"movie");
      } else {
        await likeItem({tmdbId: movieDetail?.movie.tmdbId, genreIds: movieDetail?.movie.genres.map(g => g.id),mediaType:"movie",title:movieDetail?.movie.title,posterPath:movieDetail?.movie.posterPath});
      }
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["mylist", "recent"] });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollowing = async () => {
    if (!me) return;
    if(!movieDetail) return;
    setLoading(true);
    try {
      if (isFollowing) {
        await removeFollowing(movieDetail?.movie.tmdbId,"movie");
      } else {
        await addFollowing(movieDetail?.movie.tmdbId,"movie",movieDetail?.movie.title,movieDetail?.movie.posterPath);
      }
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["mylist", "recent"] });
    } finally {
      setLoading(false);
    }
  };

  function handleSimilarDislike(movie: Movie) {
  // 1️⃣ optimistic remove (UI animasyonu)
  setSimilarState(prev => {
    const nextMovies = prev.movies.filter(
      m => m.tmdbId !== movie.tmdbId
    );

    return {
      ...prev,
      movies: nextMovies,
    };
  });

  // 2️⃣ backend log (Home ile birebir)
  dislikeMovie({
    tmdbId: movie.tmdbId,
    genreIds:
      movie.genreIds ??
      movieDetail?.movie.genres.map(g => g.id) ??
      [],
    mediaType:"movie"
  }).catch(() => {
    console.warn("similar dislike log failed");
  });

  // 3️⃣ animasyon sonrası refill kontrolü (🔥 KRİTİK)
  setTimeout(() => {
    setSimilarState(prev => {
      if (
        prev.movies.length < SIMILAR_MIN_COUNT &&
        prev.hasMore &&
        !loadingMoreRef.current
      ) {
        loadMoreSimilar(); // 👈 HOME İLE AYNI DAVRANIŞ
      }

      return prev;
    });
  }, 300);
}

  // useEffect(() => {
  //   window.scrollTo({ top: 0, left: 0 });
  // }, [id]);


  useEffect(() => {
    updateScrollButtons(
      castRowRef,
      setCanScrollLeft,
      setCanScrollRight
    );
  }, [movieDetail?.cast]);
  



  useEffect(() => {
    const el = directorRowRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
  updateScrollButtons(
    directorRowRef,
    setCanScrollLeftDirector,
    setCanScrollRightDirector
  );
  }, [movieDetail?.directors]);
    
  useEffect(() => {
    if (!me) return;
    if (!movieDetail?.movie) return;
    if (loggedRef.current) return;
    loggedRef.current = true;

    logView({
      tmdbId: movieDetail.movie.tmdbId,
      mediaType: "movie",
      genreIds: movieDetail.movie.genres.map(g => g.id),
      title: movieDetail.movie.title,
      posterPath: movieDetail?.movie.posterPath
    });
    queryClient.invalidateQueries({ queryKey: ["mylist", "recent"] });
  }, [movieDetail?.movie?.tmdbId]);

  useEffect(() => {
    if (!trailerOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTrailerOpen(false);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [trailerOpen]);


  if (isLoading && !movieDetail) {
    return <MovieDetailsSkeleton />;
  }
  if (error || !movieDetail?.movie) {
  return <div className="mv-details-error">Film bulunamadı</div>;
  }


  /* ========================= */

  const heroBackground = movieDetail?.movie.backdropPath
    ? `
      linear-gradient(to right,
        rgba(0,0,0,0.98) 0%,
        rgba(0,0,0,0.9) 30%,
        rgba(0,0,0,0.6) 55%,
        rgba(0,0,0,0.25) 75%,
        rgba(0,0,0,0.1) 100%
      ),
      url(https://image.tmdb.org/t/p/original${movieDetail?.movie.backdropPath})
    `
    : `linear-gradient(135deg, #05060a, #0b0f1a)`;

    
  return (
    <>
    <section className="mv-details-hero" style={{ backgroundImage: heroBackground }}>
      
      {/* PARTICLES */}
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{ left: `${p.x}px`, top: `${p.y}px` }}
        />
      ))}

      <div className="mv-details-container">
        {/* POSTER */}
        <div className="mv-details-poster">
          <img
            src={
              movieDetail?.movie.posterPath
                ? `https://image.tmdb.org/t/p/w500${movieDetail?.movie.posterPath}`
                : '/images/default-poster.png'
            }
            alt={movieDetail?.movie.title}
          />
          {!movieDetail?.movie.adult && <span className="mv-badge--adult">18+</span>}
        </div>

        {/* INFO */}
        <div className="mv-details-info">
          <h1 className="mv-details-title">{movieDetail?.movie.title}</h1>

          {movieDetail?.movie.tagline && (
            <p className="mv-details-tagline">“{movieDetail?.movie.tagline}”</p>
          )}

          <div className="mv-details-meta">
            <Rating value={movieDetail?.movie.voteAverage / 2} readOnly precision={0.5} size="small" />
            <span className="meta-score">{movieDetail?.movie.voteAverage.toFixed(1)}</span>
            <span>• {movieDetail?.movie.releaseDate?.slice(0, 4)}</span>
            <span>• {movieDetail?.movie.runtime} dk</span>
          </div>

          <div className="mv-details-genres">
            {movieDetail?.movie.genres.map(g => (
              <span
                key={g.id}
                className="genre-chip"
                style={{ background: TMDB_GENRES[g.id] ?? "#374151" }}
              >
                {g.name}
              </span>
            ))}
          </div>

          <p className="mv-details-overview">{movieDetail?.movie.overview}</p>
          
          {/* ACTIONS */}
          <div className="mv-details-actions">
            <button className="btn-trailer"  onClick={() => {
              if (!trailerKey) {
                toast("Fragman bulunamadı 😢");
                return;
              }
              setTrailerOpen(true);
            }}>
            <PlayArrowIcon />
            <h5>Fragmana göz at</h5>
            </button>

            {me && (
              <div className="hero-buttons">
                <button
                  className={`hero-icon-btn ${isFavorite ? "active" : ""}`}
                  onClick={handleToggleFavorite}
                  disabled={loading}
                >
                  <Heart
                    size={23}
                    strokeWidth={2}
                    fill={isFavorite ? "#ef4444" : "none"}
                    stroke={isFavorite ? "#ef4444" : "#ffffff"}
                  />
                </button>

                <button
                  className={`hero-icon-btn following ${isFollowing ? "active" : ""}`}
                  onClick={handleToggleFollowing}
                  disabled={loading}
                >
                  <BookMarked size={22} strokeWidth={2} />
                </button>

                <button className={`hero-icon-btn dislike ${isDisliked ? "active" : ""}`} onClick={handleDislike}>
                  <ThumbDownOutlinedIcon sx={{fontSize:"2.3rem"}} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
      {movieDetail.directors?.length > 0 && (
        <section className="mv-cast-section" style={{paddingBottom:"2rem"}}>
          <div className="mv-cast-container">
            <h2 className="mv-section-title">Yönetmenler</h2>

            <div className="mv-cast-wrapper">
              {canScrollLeftDirector && (
                <button
                  className="cast-nav left"
                  onClick={() => scrollRow(directorRowRef, "left")}
                >
                  ‹
                </button>
              )}

        <div
          className="mv-cast-row"
          ref={directorRowRef}
          onScroll={() =>
            updateScrollButtons(
              directorRowRef,
              setCanScrollLeftDirector,
              setCanScrollRightDirector
            )
          }
        >
          {movieDetail.directors.map(director => (
            <div key={director.id} className="mv-cast-card" onClick={() => openPersonModal(director.id)}>
              <img
                src={
                  director.profilePath
                    ? `https://image.tmdb.org/t/p/w185${director.profilePath}`
                    : "/images/avatar-placeholder.jpg"
                }
                alt={director.name}
                loading="lazy"
              />

              <div className="mv-cast-info">
                <h4 className="mv-cast-name">{director.name}</h4>
                <h5 className="mv-cast-role">Director</h5>
              </div>
            </div>
          ))}
        </div>

        {canScrollRightDirector && (
          <button
            className="cast-nav right"
            onClick={() => scrollRow(directorRowRef, "right")}
          >
            ›
          </button>
        )}
            </div>
          </div>
        </section>
      )}

      {movieDetail.cast?.length > 0 && (
    <section className="mv-cast-section">
      <div className="mv-cast-container">
         <h2 className="mv-section-title">Oyuncu Kadrosu</h2>
        <div className="mv-cast-wrapper">
          {canScrollLeft && (<button className="cast-nav left" onClick={() => scrollRow(castRowRef,"left")}>
            ‹
         </button>)}
         
          <div className="mv-cast-row" ref={castRowRef} onScroll={() =>{
            updateScrollButtons(castRowRef, setCanScrollLeft, setCanScrollRight)}}>
          {movieDetail.cast.slice(0, 20).map(actor => (
            <div key={actor.id} className="mv-cast-card" onClick={() => openPersonModal(actor.id)}>
              <img
                src={
                  actor.profilePath
                    ? `https://image.tmdb.org/t/p/w185${actor.profilePath}`
                    : "/images/avatar-placeholder.jpg"
                }
                alt={actor.name}
                loading="lazy"
              />
  
              <div className="mv-cast-info">
                <h4 className="mv-cast-name">{actor.name}</h4>
                <h5 className="mv-cast-role">{actor.character}</h5>
              </div>
              </div>
            ))}
          </div>
          {canScrollRight && (<button className="cast-nav right" onClick={() => scrollRow(castRowRef,"right")}>›</button>)}
        </div>
      </div>
    </section>
      )}

    <MovieRow
      title="Benzer Filmler"
      movies={similarState.movies}
      loading={similarState.loading}
      canInteract={isLoggedIn}
      reason={null}
      onDislike={handleSimilarDislike}
      onEndReached={loadMoreSimilar}
      isLoadingMore={similarLoadingMore}   // ✅ STATE
      hasMore={similarState.hasMore}
      link="tv"/>
      
    {trailerOpen && (
      <div className="trailer-modal">
        <div
          className="trailer-backdrop"
          onClick={() => setTrailerOpen(false)}
        />

        <div className="trailer-content">
          <button
            className="trailer-close"
            onClick={() => setTrailerOpen(false)}
          >
            ✕
          </button>

          <iframe
            src={`https://www.youtube.com/embed/${trailerKey.key}?autoplay=1`}
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="Movie Trailer"
          />
        </div>
      </div>
    )}
    {selectedPersonId && (
      <PersonModal
        personId={selectedPersonId}
        onClose={closePersonModal}
      />
    )}
    </>
  );
}
