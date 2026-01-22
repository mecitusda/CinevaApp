import { useParams } from "react-router-dom";
import { Rating } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ThumbDownOutlinedIcon from "@mui/icons-material/ThumbDownOutlined";
import { Heart, BookMarked } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import "../MovieDetail/MovieDetails.css"
import { useSeriesDetailQuery } from "../../features/movies/useSeriesDetailQuery";
import { useSimilarSeriesQuery } from "../../features/movies/useSimilarSeriesQuery";
import { useSeriesTrailerQuery } from "../../features/movies/useSeriesTrailerQuery";
import { useMeQuery } from "../../features/auth/useMeQuery";

import {
  addFollowing,
  removeFollowing,
} from "../../api/movies.api";

import { dislikeMovie, likeItem, logView, unlikeItem} from "../../api/activity.api";
import MovieDetailsSkeleton from "../MovieDetail/MovieDetail-Skeleton";
import PersonModal from "../../components/common/PersonModal";
import { Movie } from "../../types/movie";
import MovieRow from "../../components/layout/MovieRow";
import {Particle} from "../../types/Particle"



export default function SeriesDetails() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data: me } = useMeQuery();
  const isLoggedIn = !!me;

  const { data: seriesDetail, isLoading, error } = useSeriesDetailQuery(Number(id));
  const { data: trailerKey } = useSeriesTrailerQuery(seriesDetail?.series?.tmdbId);
  console.log(seriesDetail)
  const {
    data: similarData,
  } = useSimilarSeriesQuery(seriesDetail?.series?.tmdbId);

  const loadingMoreRef = useRef(false);
  const particleIdRef = useRef(0);
  const castRowRef = useRef<HTMLDivElement | null>(null);
  const creatorRowRef = useRef<HTMLDivElement | null>(null);
  const loggedRef = useRef(false);
  
  const isFavorite = me?.favorites?.some(
    (f: { tmdbId: number; mediaType: "tv" }) =>
    f.tmdbId === seriesDetail?.series?.tmdbId && f.mediaType === "tv" ) ?? false;

  const isFollowing = me?.following?.some(
    (f: { tmdbId: number; mediaType: "tv" }) =>
    f.tmdbId === seriesDetail?.series?.tmdbId && f.mediaType === "tv"
    ) ?? false;

  const [trailerOpen, setTrailerOpen] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
  const [isDisliked, setIsDisliked] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [canScrollLeftCast, setCanScrollLeftCast] = useState(false);
  const [canScrollRightCast, setCanScrollRightCast] = useState(true);
  const [canScrollLeftCreator, setCanScrollLeftCreator] = useState(false);
  const [canScrollRightCreator, setCanScrollRightCreator] = useState(true);
  const [particles, setParticles] = useState<Particle[]>([]);

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



  useEffect(() => {
    if (!me) return;
    if (!seriesDetail?.series) return;
    if (loggedRef.current) return;

    loggedRef.current = true;

    logView({
      tmdbId: seriesDetail.series.tmdbId,
      mediaType: "tv",
      genreIds: seriesDetail.series.genres.map(g => g.id),
      title: seriesDetail.series.name,
      posterPath: seriesDetail.series.posterPath,
    });
    queryClient.invalidateQueries({ queryKey: ["mylist", "recent"] });
  }, [seriesDetail?.series?.tmdbId]);

  useEffect(() => {
    if (!similarData) return;

    setSimilarState({
      movies: similarData.series,
      page: similarData.page,
      hasMore: similarData.hasMore ?? false,
      loading: false,
    });
  }, [similarData]);

  
  useEffect(() => {
    updateScrollButtons(
      castRowRef,
      setCanScrollLeftCast,
      setCanScrollRightCast
    );
  }, [seriesDetail?.cast]);
  useEffect(() => {
    updateScrollButtons(
      creatorRowRef,
      setCanScrollLeftCreator,
      setCanScrollRightCreator
    );
  }, [seriesDetail?.creators]);

  if (isLoading || !seriesDetail?.series) {
    return <MovieDetailsSkeleton />;
  }



  const { series, cast, creators } = seriesDetail;

 
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

  const heroBackground = series.backdropPath
    ? `
      linear-gradient(to right,
        rgba(0,0,0,0.98) 0%,
        rgba(0,0,0,0.9) 30%,
        rgba(0,0,0,0.6) 55%,
        rgba(0,0,0,0.25) 75%,
        rgba(0,0,0,0.1) 100%
      ),
      url(https://image.tmdb.org/t/p/original${series.backdropPath})
    `
    : `linear-gradient(135deg, #05060a, #0b0f1a)`;

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
  /* ========================= */
   if (error) {
    return <div className="mv-details-error">Dizi bulunamadı</div>;
  }
  return (
    <>
      <section className="mv-details-hero" style={{ backgroundImage: heroBackground }}>
        {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{ left: `${p.x}px`, top: `${p.y}px` }}
        />
      ))}
        <div className="mv-details-container">
          <div className="mv-details-poster">
            <img
              src={
                series.posterPath
                  ? `https://image.tmdb.org/t/p/w500${series.posterPath}`
                  : "/images/default-poster.png"
              }
              alt={series.name}
            />
          </div>

          <div className="mv-details-info">
            <h1 className="mv-details-title">{series.name}</h1>

            <div className="mv-details-meta">
              <Rating
                value={series.voteAverage / 2}
                readOnly
                precision={0.5}
                size="small"
              />
              <span className="meta-score">
                {series.voteAverage.toFixed(1)}
              </span>
              <span>• {series.firstAirDate?.slice(0, 4)}</span>
              <span>• {series.numberOfSeasons} Sezon</span>
            </div>

            <p className="mv-details-overview">{series.overview}</p>

            <div className="mv-details-actions">
              <button
                className="btn-trailer"
                onClick={() => {
                  if (!trailerKey) {
                    toast("Fragman bulunamadı 😢");
                    return;
                  }
                  setTrailerOpen(true);
                }}
              >
                <PlayArrowIcon />
                <h5>Fragmana göz at</h5>
              </button>

              {me && (
                <div className="hero-buttons">
                  <button
                    className={`hero-icon-btn ${isFavorite ? "active" : ""}`}
                    onClick={async (e) => {
                      createParticles(e)
                      setLoading(true);
                      if (isFavorite) {
                        await unlikeItem(series.tmdbId,"tv");
                      } else {
                        await likeItem({
                          tmdbId: series.tmdbId,
                          genreIds: series.genres.map(g => g.id),
                          mediaType:"tv",
                          title:series.name,
                          posterPath:series.posterPath,
                        });
                      }
                      queryClient.invalidateQueries({ queryKey: ["me"] });
                      queryClient.invalidateQueries({ queryKey: ["mylist", "recent"] });
                      setLoading(false);
                    }}
                  >
                    <Heart
                      size={23}
                      fill={isFavorite ? "#ef4444" : "none"}
                      stroke={isFavorite ? "#ef4444" : "#ffffff"}
                    />
                  </button>

                  <button
                    className={`hero-icon-btn following ${isFollowing ? "active" : ""}`}
                    onClick={async () => {
                      setLoading(true);
                      isFollowing
                        ? await removeFollowing(series.tmdbId,"tv")
                        : await addFollowing(series.tmdbId,"tv",seriesDetail.series.name,seriesDetail.series.posterPath);
                      queryClient.invalidateQueries({ queryKey: ["me"] });
                      queryClient.invalidateQueries({ queryKey: ["mylist", "recent"] });
                      setLoading(false);
                    }}
                  >
                    <BookMarked size={22} />
                  </button>

                  <button
                    className={`hero-icon-btn dislike ${isDisliked ? "active" : ""}`}
                    onClick={async () => {
                      await dislikeMovie({
                        tmdbId: seriesDetail.series.tmdbId,
                        genreIds: seriesDetail.series.genres.map(g => g.id),
                        mediaType:"tv"
                      });
                      setIsDisliked(true);
                    }}
                  >
                    <ThumbDownOutlinedIcon  sx={{fontSize:"2.3rem"}}  />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 🎬 CREATORS */}
      {creators?.length > 0 && (
        <section className="mv-cast-section">
          <div className="mv-cast-container">
            <h2 className="mv-section-title">Yapımcılar</h2>

            <div className="mv-cast-wrapper">
              {canScrollLeftCreator && (
                <button
                  className="cast-nav left"
                  onClick={() => scrollRow(creatorRowRef, "left")}
                >
                  ‹
                </button>
              )}

              <div
                className="mv-cast-row"
                ref={creatorRowRef}
                onScroll={() =>
                  updateScrollButtons(
                    creatorRowRef,
                    setCanScrollLeftCreator,
                    setCanScrollRightCreator
                  )
                }
              >
                {creators.map(c => (
                  <div
                    key={c.id}
                    className="mv-cast-card"
                    onClick={() => setSelectedPersonId(c.id)}
                  >
                    <img
                      src={
                        c.profilePath
                          ? `https://image.tmdb.org/t/p/w185${c.profilePath}`
                          : "/images/avatar-placeholder.jpg"
                      }
                      alt={c.name}
                    />
                    <div className="mv-cast-info">
                      <h4 className="mv-cast-name">{c.name}</h4>
                      <h5 className="mv-cast-role">Director</h5>
                    </div>
                  </div>
                ))}
              </div>

              {canScrollRightCreator && (
                <button
                  className="cast-nav right"
                  onClick={() => scrollRow(creatorRowRef, "right")}
                >
                  ›
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 🎭 CAST */}
      {cast?.length > 0 && (
        <section className="mv-cast-section">
          <div className="mv-cast-container">
            <h2 className="mv-section-title">Oyuncu Kadrosu</h2>

            <div className="mv-cast-wrapper">
              {canScrollLeftCast && (
                <button
                  className="cast-nav left"
                  onClick={() => scrollRow(castRowRef, "left")}
                >
                  ‹
                </button>
              )}

              <div
                className="mv-cast-row"
                ref={castRowRef}
                onScroll={() =>
                  updateScrollButtons(
                    castRowRef,
                    setCanScrollLeftCast,
                    setCanScrollRightCast
                  )
                }
              >
                {cast.map(actor => (
                  <div
                    key={actor.id}
                    className="mv-cast-card"
                    onClick={() => setSelectedPersonId(actor.id)}
                  >
                    <img
                      src={
                        actor.profilePath
                          ? `https://image.tmdb.org/t/p/w185${actor.profilePath}`
                          : "/images/avatar-placeholder.jpg"
                      }
                      alt={actor.name}
                    />
                    <div className="mv-cast-info">
                      <h4 className="mv-cast-name">{actor.name}</h4>
                      <h5 className="mv-cast-role">{actor.character}</h5>
                    </div>
                  </div>
                ))}
              </div>

              {canScrollRightCast && (
                <button
                  className="cast-nav right"
                  onClick={() => scrollRow(castRowRef, "right")}
                >
                  ›
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 🔁 BENZER DİZİLER */}
      <MovieRow
        title="Benzer Diziler"
        movies={similarState.movies}
        loading={similarState.loading}
        canInteract={isLoggedIn}
        hasMore={similarState.hasMore}
        reason={null}
        onDislike={() => {}}
        link="tv"
      />

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
            src={`https://www.youtube.com/embed/${trailerKey?.key}?autoplay=1`}
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
          onClose={() => setSelectedPersonId(null)}
        />
      )}
    </>
  );
}
