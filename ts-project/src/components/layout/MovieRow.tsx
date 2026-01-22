import { useEffect, useRef, useState } from "react";
import MovieCard from "../common/MovieCard";
import { SkeletonMovieCard } from "../common/SkeletonMovieCard";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
const MIN_COUNT = 6;

type Props = {
  title: string;
  movies: any[];
  loading?: boolean;
  hasMore?: boolean; // ✅
  reason: { text: string } | null;
  onDislike: (movie: any) => void;
  canInteract: boolean;
  onEndReached?: () => void;
  isLoadingMore?: boolean;
  link: "movie" | "tv"
};



export default function MovieRow({
  title,
  movies,
  reason,
  onDislike,
  canInteract,
  loading,
  onEndReached,
  hasMore,
  isLoadingMore,
  link
}: Props) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const SKELETON_COUNT = Math.ceil((rowRef.current?.clientWidth ?? 1800) / 230);
  function updateScrollButtons() {
  if (!rowRef.current) return;

  const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;

  setCanScrollLeft(scrollLeft > 5); // başta değilse
  setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5); // sonda değilse
  }

 useEffect(() => {
  if (!loading) {
    updateScrollButtons();
  }
}, [movies, loading]);


function scroll(dir: "left" | "right") {
  if (!rowRef.current) return;

  const el = rowRef.current;
  const { scrollLeft, clientWidth, scrollWidth } = el;

  const maxScroll = scrollWidth - clientWidth;
  const delta = clientWidth * 0.75;

  let target =
    dir === "right"
      ? scrollLeft + delta
      : scrollLeft - delta;

  // 🔒 CLAMP
  target = Math.max(0, Math.min(target, maxScroll));

  el.scrollTo({
    left: target,
    behavior: "smooth",
  });
  setTimeout(updateScrollButtons, 400);

}

function handleScroll() {
  if (!rowRef.current) return;

  updateScrollButtons();

  if (loading || isLoadingMore || hasMore === false) return;

  const { scrollLeft, clientWidth, scrollWidth } = rowRef.current;
  const PREFETCH_OFFSET = clientWidth * 1.5;

  if (scrollLeft + clientWidth >= scrollWidth - PREFETCH_OFFSET) {
    onEndReached?.();
  }
}




  
  return (
    <section style={{ marginBottom: 0, position: "relative", overflowX: "visible"}}>
      {/* Header */}
      <div style={{ marginBottom: 0, padding: '10px 15px', color:"white" }}>
        <h2 style={{ margin: 0 }}>{reason ? reason.text : title}</h2>
      </div>

    {!loading && canScrollLeft  && (
  <button
    onClick={() => scroll("left")}
    className="row-arrow left"
  >
   <NavigateBeforeIcon style={{width:"24px",height:"24px"}}/>
  </button>
    )}

    {!loading && canScrollRight &&  (
  <button
    onClick={() => scroll("right")}
    className="row-arrow right"
  >
    <NavigateNextIcon  style={{width:"24px",height:"24px"}}/>
  </button>
    )}

      {/* MOVIE ROW */}
      <div
        ref={rowRef}
        className="movie-row"
        onScroll={handleScroll}>
         
        {loading
    ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <SkeletonMovieCard key={i} />
      ))
    :   
        <>
        {movies?.map((movie) => (
          <MovieCard
            key={`${movie.tmdbId}-${movies.length}`}
            movie={movie}
            onDislike={onDislike}
            canInteract={canInteract}
            link={link}
          />
        ))}
        {isLoadingMore && (
          <div className="movie-card loading-card">
            <div className="spinner" />
          </div>
        )}
        </>
        

        }
      </div>
    </section>
  );
}
