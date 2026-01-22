export default function MovieDetailsSkeleton() {
  return (
    <>
      {/* HERO SKELETON */}
      <section className="mv-details-hero skeleton">
        <div className="mv-details-container">
          {/* POSTER */}
          <div className="mv-details-poster skeleton-box poster" />

          {/* INFO */}
          <div className="mv-details-info">
            <div className="skeleton-line title" />
            <div className="skeleton-line tagline" />

            <div className="skeleton-meta">
              <div className="skeleton-line small" />
              <div className="skeleton-line small" />
              <div className="skeleton-line small" />
            </div>

            <div className="skeleton-genres">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton-chip" />
              ))}
            </div>

            <div className="skeleton-paragraph">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton-line paragraph" />
              ))}
            </div>

            <div className="skeleton-actions">
              <div className="skeleton-btn" />
              <div className="skeleton-icon" />
              <div className="skeleton-icon" />
              <div className="skeleton-icon" />
            </div>
          </div>
        </div>
      </section>

      {/* 🎭 CAST SKELETON */}
      <section className="mv-cast-section skeleton">
        <div className="mv-cast-container">
          <div className="skeleton-line section-title" />

          <div className="mv-cast-row skeleton-row">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="mv-cast-card skeleton-cast-card">
                <div className="skeleton-box cast-avatar" />
                <div className="skeleton-line cast-name" />
                <div className="skeleton-line cast-role" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
