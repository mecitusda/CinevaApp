import { useNavigate } from "react-router-dom";
import { useMyRecentQuery } from "../../features/auth/useMyRecentQuery";
import "./myList.css";
import CloseIcon from '@mui/icons-material/Close';
import { unlikeItem } from "../../api/activity.api";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { removeFollowing } from "../../api/movies.api";
import { useState } from "react";
export default function MyList() {
  const navigate = useNavigate();
  const { data, isLoading } = useMyRecentQuery();
  const queryClient = useQueryClient();
  const [removingKey, setRemovingKey] = useState<string | null>(null);
  return (
    <div className="mylist-page">
      {/* =========================
          👁 SON BAKTIKLARIM
      ========================= */}
      <section className="mylist-section">
        <h2 className="mylist-header">Son Baktıklarım</h2>
        <div className="mylist-inner">
          {data?.recentlyViewed?.length === 0 ? (
          <p className="mylist-empty-text">
            Henüz bir içerik incelenmedi.
          </p>
        ) : (
          <div className="mylist-grid">
            {data?.recentlyViewed?.map((item) => (
              <div
                key={`recent-${item.mediaType}-${item.tmdbId}`}
                className="mylist-card"
                onClick={() =>
                  navigate(`/${item.mediaType}/${item.tmdbId}`)
                }
              >
                <div className="mylist-poster">
                  <img
                    src={`https://image.tmdb.org/t/p/w342/${item.posterPath}`}
                    alt={item.title}
                    loading="lazy"
                  />
                  <span className={`badge ${item.mediaType}`}>
                    {item.mediaType === "movie" ? "Film" : "Dizi"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
        
      </section>

      {/* =========================
          ❤️ BEĞENDİKLERİM
      ========================= */}
      <section className="mylist-section">
        <h2 className="mylist-header">Beğendiklerim</h2>
        <div className="mylist-inner">
          {data?.favorites?.length === 0 ? (
          <p className="mylist-empty-text">
            Henüz beğenilen içerik yok
          </p>
        ) : (
          <div className="mylist-grid">
            {data?.favorites.map((item) => {
            const key = `fav-${item.mediaType}-${item.tmdbId}`;
              const isRemoving = removingKey === key;
                        
              return (
                <div
                  key={key}
                  className={`mylist-card ${isRemoving ? "removing" : ""}`}
                >
                  <div
                    className="mylist-poster"
                    onClick={() =>
                      navigate(`/${item.mediaType}/${item.tmdbId}`)
                    }
                  >
                    {item.posterPath ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w342/${item.posterPath}`}
                        alt={item.title}
                      />
                    ) : (
                      <div className="mylist-poster-fallback">
                        <span>{item.title}</span>
                      </div>
                    )}
            
                    <span className={`badge ${item.mediaType}`}>
                      {item.mediaType === "movie" ? "Film" : "Dizi"}
                    </span>
                  
                    <CloseIcon
                      className={`remove-btn ${item.mediaType}`}
                      style={{ fontSize: "2.2rem" }}
                      onClick={async (e) => {
                        e.stopPropagation();
                      
                        const removeKey = `fav-${item.mediaType}-${item.tmdbId}`;
                        setRemovingKey(removeKey);
                      
                        // ⏱ animasyon süresi
                        setTimeout(async () => {
                          try {
                            await unlikeItem(item.tmdbId, item.mediaType);
                          
                            queryClient.setQueryData(["mylist", "recent"], (old: any) => {
                              if (!old) return old;

                              return {
                                ...old,
                                favorites: old.favorites.filter(
                                  (f: any) =>
                                    !(f.tmdbId === item.tmdbId && f.mediaType === item.mediaType)
                                ),
                              };
                            });
                            queryClient.invalidateQueries({ queryKey: ["me"] });
                          
                            toast.success("Beğenilerden kaldırıldı");
                          } catch {
                            toast.error("Bir hata oluştu");
                          } finally {
                            setRemovingKey(null);
                          }
                        }, 220); // CSS ile aynı süre
                      }}
                    />
                  </div>
                    
                  <div className="mylist-card-title">
                    {item.title}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
      </section>

      {/* =========================
          🔖 TAKİP ETTİKLERİM
      ========================= */}
      <section className="mylist-section">
        <h2 className="mylist-header">Takip Ettiklerim</h2>
        <div className="mylist-inner">
           {data?.following?.length === 0 ? (
          <p className="mylist-empty-text">
            Henüz takip edilen içerik yok
          </p>
        ) : (
          <div className="mylist-grid">
            {data?.following.map((item) => {
  const key = `follow-${item.mediaType}-${item.tmdbId}`;
  const isRemoving = removingKey === key;

  return (
    <div
      key={key}
      className={`mylist-card ${isRemoving ? "removing" : ""}`}
    >
      <div
        className="mylist-poster"
        onClick={() =>
          navigate(`/${item.mediaType}/${item.tmdbId}`)
        }
      >
        <img
          src={`https://image.tmdb.org/t/p/w342/${item.posterPath}`}
          alt={item.title}
          loading="lazy"
        />

        <span className={`badge ${item.mediaType}`}>
          {item.mediaType === "movie" ? "Film" : "Dizi"}
        </span>

        <CloseIcon
          className={`remove-btn ${item.mediaType}`}
          style={{ fontSize: "2.2rem" }}
          onClick={(e) => {
            e.stopPropagation();

            setRemovingKey(key);

            setTimeout(async () => {
              try {
                // 1️⃣ UI’DAN ANINDA SİL
                queryClient.setQueryData(
                  ["mylist", "recent"],
                  (old: any) => {
                    if (!old) return old;

                    return {
                      ...old,
                      following: old.following.filter(
                        (f: any) =>
                          !(
                            f.tmdbId === item.tmdbId &&
                            f.mediaType === item.mediaType
                          )
                      ),
                    };
                  }
                );

                // 2️⃣ SERVER
                await removeFollowing(item.tmdbId, item.mediaType);

                // 3️⃣ DİĞER STATE’LER
                queryClient.invalidateQueries({ queryKey: ["me"] });

                toast.success("Takipten çıkarıldı");
              } catch {
                toast.error("Bir hata oluştu");
                queryClient.invalidateQueries({
                  queryKey: ["mylist", "recent"],
                });
              } finally {
                setRemovingKey(null);
              }
            }, 220); // CSS animasyon süresi
          }}
        />
      </div>

      <div className="mylist-card-title">
        {item.title}
      </div>
    </div>
  );
})}

          </div>
        )}
        </div>
      </section>
    </div>
  );
}
