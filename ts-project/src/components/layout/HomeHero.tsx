import { useNavigate } from "react-router-dom";
import { Movie } from "../../types/movie";
import "./css/homeHero.css";
import { useState, useRef, useEffect } from "react";
import { Heart, BookMarked } from "lucide-react";
import { Rating } from "@mui/material";
import { useMeQuery } from "../../features/auth/useMeQuery";
import { addFollowing, removeFollowing } from "../../api/movies.api";
import { useQueryClient } from "@tanstack/react-query";
import { useTrailerQuery } from "../../features/movies/useMovieTrailerQuery";
import { HeroSkeleton } from "../common/HeroSkeleton" 
import PlayDisabledIcon from '@mui/icons-material/PlayDisabled';
import { likeItem, unlikeItem } from "../../api/activity.api";
import { Particle } from "../../types/Particle";
import toast from "react-hot-toast";


type Props = {
  movie: Movie;
};



export default function Hero({ movie }: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: me } = useMeQuery();
  const { data: trailer, isLoading: trailerLoading } = useTrailerQuery(movie?.tmdbId);
  const [loading, setLoading] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleIdRef = useRef(0);
  const isFavorite = me?.favorites?.some(
    (f: { tmdbId: number; mediaType: "movie" | "tv" }) =>
    f.tmdbId === movie?.tmdbId && f.mediaType === "movie" ) ?? false;
  const isFollowing = me?.following?.some(
    (f: { tmdbId: number; mediaType: "movie" | "tv" }) =>
    f.tmdbId === movie?.tmdbId && f.mediaType === "movie"
    ) ?? false;
  const [bgMovie, setBgMovie] = useState<Movie | null>(movie);
  const [isBgTransitioning, setIsBgTransitioning] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);




  useEffect(() => {
  const hasSeenHero = sessionStorage.getItem("hero-mounted");

  if (!hasSeenHero) {
    setShouldAnimate(true);
    sessionStorage.setItem("hero-mounted", "1");
  }
}, []);


  

  useEffect(() => {
    setShowTrailer(false);
    const t = setTimeout(() => setShowTrailer(true), 200);
    return () => clearTimeout(t);
  }, [movie?.tmdbId]);


 
  useEffect(() => {
  if (!movie) return;
  if (movie.tmdbId === bgMovie?.tmdbId) return;

  setIsBgTransitioning(true);

  const t = setTimeout(() => {
    setBgMovie(movie);
    setIsBgTransitioning(false);
  }, 300);

  return () => clearTimeout(t);
}, [movie?.tmdbId]);

  if(!movie) return <HeroSkeleton isLoggedIn={me?true:false}/>
  
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

    setParticles((prev) => [...prev, ...newParticles]);

    // Partikleri 600ms sonra kaldır
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 600);
  };

  const handleToggleFavorite = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!me) return;
    if (!movie?.tmdbId) return;
    createParticles(e);
    setLoading(true);
    try {
      if (isFavorite) {
        await unlikeItem(movie?.tmdbId,"movie");
      } else {
        await likeItem({tmdbId:movie?.tmdbId, mediaType:"movie",genreIds: movie?.genreIds.map(g => g),title:movie?.title,posterPath:movie?.posterPath});
      }
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["mylist", "recent"] });
    } catch (err) {
      console.error("Toggle favorite failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollowing = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!me) return;
    if (!movie?.tmdbId) return;
    setLoading(true);
    try {
      if (isFollowing) {
        await removeFollowing(movie?.tmdbId,"movie");
      } else {
        await addFollowing(movie?.tmdbId,"movie",movie?.title,movie?.posterPath);
      }
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["mylist", "recent"] });
    } catch (err) {
      console.error("Toggle following failed:", err);
    } finally {
      setLoading(false);
    }
  };



  return (
    <section className={`hero ${shouldAnimate ? "hero--animate" : "hero--static"}`}>

      
      {/* ESKİ BG (fade-out) */}
        {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
          }}
        />
      ))}
      <div
        className={`hero-bg ${isBgTransitioning ? "fade-out" : "fade-in"}`}
  style={{
    backgroundImage: bgMovie
      ? `url(https://image.tmdb.org/t/p/original${bgMovie.backdropPath})`
      : "none",
  }}
      />

      <div className={`hero-blackout ${isBgTransitioning ? "active" : ""}`} />

  <div className="hero-mask">
      <div className="hero-content">
        {/* bottom fade */}
      <div className="hero-fade" />
      
         {/* Particles */}
     
        <h1 className="hero-title">{movie?.title}</h1>

        {/* META */}
        <div className="hero-meta">
          <div className="hero-rating">
            <Rating 
              value={movie?.voteAverage / 2} 
              readOnly 
              precision={0.5}
              size="medium"
            />
            <span className="rating-text">({movie?.voteAverage.toFixed(1)})</span>
          </div>
          {movie?.releaseDate && (
            <span>{movie?.releaseDate.slice(0, 4)}</span>
          )}
        </div>

        {/* OVERVIEW */}
        <p className="hero-overview">
          {movie?.overview.length > 220
            ? movie?.overview.slice(0, 220) + "..."
            : movie?.overview}
        </p>

        {/* ACTIONS */}
        <div className="hero-actions">
          <button
            className="btn-primary"
            onClick={() => navigate(`/movie/${movie?.tmdbId}`)}
          >
            Göz at
          </button>

          {me && (
            <div className="hero-buttons">
              <button
                className={`hero-icon-btn ${isFavorite ? "active" : ""}`}
                onClick={handleToggleFavorite}
                disabled={loading}
                title="Favori Ekle"
                aria-label="Add to favorites"
              >
                <Heart
                  size={24}
                  strokeWidth={2}
                  fill={isFavorite ? "#ef4444" : "none"}
                  stroke={isFavorite ? "#ef4444" : "#ffffff"}
                />
              </button>

              <button
                className={`hero-icon-btn following ${isFollowing ? "active" : ""}`}
                onClick={handleToggleFollowing}
                disabled={loading}
                title="Takip Et"
                aria-label="Follow"
              >
                <BookMarked
                  size={22}
                  strokeWidth={2}
                  fill={"none"}
                  stroke={'currentColor'}
                />
              </button>
            </div>
          )}
        </div>
        
      </div>
      {showTrailer && (
  <div className="hero-media">
    {!trailerLoading && trailer ? (
      <iframe
        className="hero-trailer"
        src={`https://www.youtube.com/embed/${trailer.key}?autoplay=0&mute=1&controls=1`}
        title="Movie Trailer"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    ) : (
      <div className="hero-trailer hero-trailer--empty">
        <div className="hero-trailer-empty-content">
          <span className="emoji"><PlayDisabledIcon style={{fontSize:"5rem"}}/></span>
          <p>Bu film için fragman bulunamadı</p>
        </div>
      </div>
    )}
  </div>
)}

   </div>

    </section>
    
  );
}
