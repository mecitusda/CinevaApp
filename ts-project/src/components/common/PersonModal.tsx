import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { usePersonDetailQuery } from "../../features/movies/usePersonQuery";
import "./css/personModal.css";
import { PersonMovies } from "../../types/PersonDetailResponse";
import { useEffect, useRef, useState } from "react";

type Props = {
  personId: number;
  onClose: () => void;
};

export default function PersonModal({ personId, onClose }: Props) {
 const { data, isLoading } = usePersonDetailQuery(personId);

  const moviesRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function updateScrollState() {
    const el = moviesRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(
      el.scrollLeft + el.clientWidth < el.scrollWidth - 1
    );
  }
  function scroll(dir: "left" | "right") {
    const el = moviesRef.current;
    if (!el) return;

    el.scrollBy({
      left: dir === "left" ? -800 : 800,
      behavior: "smooth",
    });

    // smooth scroll sonrası state güncelle
    setTimeout(updateScrollState, 250);
  }
  useEffect(() => {
    if (!data?.movies?.length) return;
    updateScrollState();
  }, [data?.movies]);

  useEffect(() => {
  // modal açılınca body scroll kilitle
  const originalOverflow = document.body.style.overflow;
  const originalPaddingRight = document.body.style.paddingRight;

  document.body.style.overflow = "hidden";

  // scrollbar kaybolunca layout kaymasın diye (Windows için)
  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth;
  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }

  return () => {
    // modal kapanınca eski haline getir
    document.body.style.overflow = originalOverflow;
    document.body.style.paddingRight = originalPaddingRight;
  };
}, []);
  // ⬇️ RETURN EN SONA
  if (!personId) return null;

  return (
    <div className="pm-overlay" onClick={onClose}>
      <div className="pm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="pm-close" onClick={onClose}>
          <X size={22} />
        </button>

        {isLoading || !data ? (
          <div className="pm-loading">
            <div className="pm-spinner" />
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="pm-header">
              <div className="pm-avatar">
                <img
                  src={
                    data.person.profilePath
                      ? `https://image.tmdb.org/t/p/w300${data.person.profilePath}`
                      : "/images/avatar-placeholder.jpg"
                  }
                  alt={data.person.name}
                />
              </div>

              <div className="pm-header-info">
                <h2 className="pm-name">{data.person.name}</h2>
                <p className="pm-department">
                  {data.person.knownForDepartment}
                </p>
                {data.person.birthday && (
                  <span className="pm-birthday">
                    🎂 {data.person.birthday}
                  </span>
                )}
              </div>
            </div>

            {/* BIO */}
            {data.person.biography && (
              <p className="pm-bio">{data.person.biography}</p>
            )}

            {/* MOVIES */}
            {data.movies.length > 0 && (
              <div className="pm-movies-section">
                <h3 className="pm-section-title">Öne Çıkan Yapımlar</h3>

                <div className="pm-movies-wrapper">
                  <button
                    className={`pm-scroll-btn left ${
                      !canScrollLeft ? "disabled" : ""
                    }`}
                    onClick={() => scroll("left")}
                    disabled={!canScrollLeft}
                  >
                    <ChevronLeft size={26} />
                  </button>

                  <div
                    className="pm-movies"
                    ref={moviesRef}
                    onScroll={updateScrollState}
                  >
                    {data.movies.map((m: PersonMovies) => (
                      <div key={m.tmdbId} className="pm-movie-card">
                        <div className="pm-poster-wrapper">
                          <img
                            src={
                              m.posterPath
                                ? `https://image.tmdb.org/t/p/w185${m.posterPath}`
                                : "/images/default-poster.png"
                            }
                            alt={m.title}
                          />
                          <div className="pm-poster-title">
                            {m.title}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    className={`pm-scroll-btn right ${
                      !canScrollRight ? "disabled" : ""
                    }`}
                    onClick={() => scroll("right")}
                    disabled={!canScrollRight}
                  >
                    <ChevronRight size={26} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
