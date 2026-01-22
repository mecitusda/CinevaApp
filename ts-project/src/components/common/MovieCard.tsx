import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import FavoriteIcon from '@mui/icons-material/Favorite';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import toast from "react-hot-toast";
type Props = {
  movie: any;
  onDislike: (movie: any) => void;
  canInteract: boolean;
  link: "movie" | "tv"
};



export default function MovieCard({
  movie,
  onDislike,
  canInteract,
  link
}: Props) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [removing, setRemoving] = useState(false); // ✅ yeni


  function handleDislikeWithAnim() {
    setRemoving(true);
    // 🎯 animasyon bitsin, sonra gerçekten silinsin
    toast("Geri bildiriminiz alındı. Artık bu tarz filmler daha az gösterilicek.")
    setTimeout(() => {
      onDislike(movie);
    }, 280);
  }

  return (
    <div
      className="movie-card"
      style={{
        flexShrink: 0,
        transition: "opacity 280ms ease, transform 280ms ease",
        opacity: removing ? 0 : 1,
        transform: removing
          ? "scale(0.92) translateY(-100px)"
          : "scale(1)",
        pointerEvents: removing ? "none" : "auto",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      
      {/* Poster Wrapper */}
      <div
        style={{
          position: "relative",
          borderRadius: 10,
          overflow: "hidden",
          transition: "all 0.25s ease",
          boxShadow: hovered
            ? "0 16px 40px rgba(0,0,0,0.45)"
            : "0 6px 16px rgba(0,0,0,0.25)",
          transform: hovered ? "scale(1.06)" : "scale(1)",
          zIndex: hovered ? 10 : 1,
        }}
        className="movie-card-poster"
      >
        
        
        <img
          src={`https://image.tmdb.org/t/p/w342${movie.posterPath}`}
          alt={movie.title}
          style={{
            width: "100%",
            display: "block",
            cursor: "pointer",
          }}
          onClick={() => navigate(`/${link}/${movie.tmdbId}`)}
        />

        {/* Action Overlay */}
        {canInteract && hovered && !removing && (
  <div
    
    className="movie-card-actions"
    onClick={(e) => e.stopPropagation()}
  >

    <button className="movie-card-btn dislike" onClick={handleDislikeWithAnim}>
      <ThumbDownIcon />
    </button>
  </div>
)}

      </div>

      {/* Title */}
      <div
        style={{
          marginTop: 8,
          fontSize: 15,
          fontWeight: 500,
          lineHeight: "1.3em",
          maxHeight: "2.6em",
          overflow: "hidden",
          color: "white",
          textAlign: "center"
        }}
      >
        {movie.title}
      </div>
    </div>
  );
}
