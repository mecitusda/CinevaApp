type props = {
  isLoggedIn: boolean
}
export function HeroSkeleton({isLoggedIn}:props) {
  return (
    <section className="hero hero--skeleton">
      <div className="hero-bg skeleton-bg" />

      <div className="hero-blackout active" />

      <div className="hero-mask">
        <div className="hero-content">
          <div className="hero-fade" />

          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-meta" />

          <div className="skeleton skeleton-overview line" />
          <div className="skeleton skeleton-overview line short" />

          <div className="hero-actions">
            <div className="skeleton skeleton-btn" />
            {
              isLoggedIn &&                 
                <div className="hero-buttons">
                  <div className="skeleton skeleton-icon-btn" />
                  <div className="skeleton skeleton-icon-btn" />
                </div>
            }
           
          </div>
        </div>

        <div className="hero-media">
          <div className="skeleton skeleton-trailer" />
        </div>
      </div>
    </section>
  );
}

