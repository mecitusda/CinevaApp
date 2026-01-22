import { HomeResponse, useHomeQuery } from '../../features/movies/useHomeQuery';
import MovieRow from '../../components/layout/MovieRow';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dislikeMovie } from '../../api/activity.api';
import { useMeQuery } from '../../features/auth/useMeQuery';
import HomeHero from '../../components/layout/HomeHero';
import { useEffect, useMemo, useRef, useState } from 'react';
import { RowsState } from '../../types/RecommendedRow';
import { getMoreMovies } from '../../api/movies.api';
import { RowType } from "../../types/RecommendedRow"
import { Movie } from '../../types/movie';
export default function Home() {

  const { data } = useHomeQuery();
  const queryClient = useQueryClient();

  const rows: RowsState = {
  trending: data?.trending ?? {
    movies: [],
    page: 1,
    loading: true,
  },
  discovery: data?.discovery ?? {
    movies: [],
    page: 1,
    loading: true,
  },
  recommended: data?.recommended ?? {
    movies: [],
    page: 1,
    loading: true,
    reason: null
  },
  };

  
  
  const loadingMoreRef = useRef<Record<RowType, boolean>>({
  trending: false,
  discovery: false,
  recommended: false,
  });

  const [loadingMore, setLoadingMore] = useState<Record<RowType, boolean>>({
  trending: false,
  discovery: false,
  recommended: false,
});
  const { data: me } = useMeQuery();
  const isLoggedIn = !!me;

  function handleDislike(rowType: RowType, movie: Movie) {
  // 1️⃣ optimistic remove (animasyon için)
  queryClient.setQueryData<HomeResponse>(
  ['home', isLoggedIn],
  (prev) => {
    if (!prev) return prev;

    const row =
      rowType === "recommended"
        ? prev.recommended
        : prev[rowType];

    if (!row) return prev;

    return {
      ...prev,
      [rowType]: {
        ...row,
        movies: row.movies.filter(
          (m: Movie) => m.tmdbId !== movie.tmdbId
        ),
      },
    };
  }
);

  // 2️⃣ SUNUCUYA LOG GİT (🔴 KRİTİK)
  dislikeMutation.mutate({
    tmdbId: movie.tmdbId,
    genreIds: movie.genreIds ?? [],
    mediaType: 'movie',
  });

  // 3️⃣ animasyon bittikten sonra refill kontrolü
  setTimeout(() => {
    const current = queryClient.getQueryData<HomeResponse>(["home",isLoggedIn]);
    if (!current) return;

    const row =
  rowType === "recommended"
    ? current.recommended ?? null
    : current[rowType];


    if (!row) return;

    if (row.movies.length < 9  && row.hasMore !== false) {
      loadMore(rowType);
    }
  }, 300); // animasyon süresiyle aynı
  }
  async function loadMore(type: RowType) {
 
  if (loadingMoreRef.current[type]) return;
  loadingMoreRef.current[type] = true;
  setLoadingMore(prev => ({...prev, [type]: true}))
  try {
    const current = queryClient.getQueryData<HomeResponse>(["home",isLoggedIn]);
    if (!current) return;

    const rowState =
      type === "recommended"
        ? current.recommended
        : current[type];
    if (!rowState || rowState.hasMore === false) return;

    const excludeIds = rowState.movies.map((m: Movie) => m.tmdbId);

    const newMovies = await getMoreMovies({
      type,
      excludeIds,
      limit: 20
    });

    if (!newMovies.length) {
  queryClient.setQueryData(["home",isLoggedIn], (prev: any) => {
    if (!prev) return prev;

    if (type === "recommended") {
      return {
        ...prev,
        recommended: {
          ...prev.recommended,
          hasMore: false,
        },
      };
    }

    return {
      ...prev,
      [type]: {
        ...prev[type],
        hasMore: false,
      },
    };
  });

  return;
    }

    queryClient.setQueryData(["home",isLoggedIn], (prev: any) => {
      const existing = prev[type].movies;

      return {
        ...prev,
        [type]: {
          ...prev[type],
          movies: [
            ...existing,
            ...newMovies.filter(
              (m: Movie) =>
                !existing.some((p: Movie) => p.tmdbId === m.tmdbId)
            ),
          ],
        },
      };
    });
  } finally {
    loadingMoreRef.current[type] = false;
    setLoadingMore(prev => ({ ...prev, [type]: false }));
  }
  }




  const dislikeMutation = useMutation({
    mutationFn: dislikeMovie,
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['home', isLoggedIn] });
    }
  });

  // useEffect(() => {
  //   window.scrollTo({ top: 0, left: 0 });
  // }, [me]);
  return (
    <>

   
    <HomeHero movie={rows.trending.movies[0]}  />
    
    <MovieRow
      title="Trendler"
      movies={rows?.trending.movies}
      onDislike={(movie) => handleDislike('trending', movie)}
      reason={null}
      canInteract={isLoggedIn}
      loading={rows.trending.loading}
      onEndReached={() => loadMore("trending")}
      isLoadingMore={loadingMore.trending}
      hasMore={rows.trending.hasMore}
      link='movie'
      />

    {
      isLoggedIn &&
    <MovieRow
      title="Sana Göre"
      movies={rows?.recommended?.movies ?? []}
      onDislike={(movie) => handleDislike('recommended', movie)}
      reason={rows?.recommended?.reason ?? null}
      canInteract={isLoggedIn}
      loading={rows.recommended?.loading}
      onEndReached={() => loadMore("recommended")}
      isLoadingMore={loadingMore.recommended}
      hasMore={rows.recommended?.hasMore}
      link='movie'
    />
  } 
    <MovieRow
      title="Keşfet"
      movies={rows?.discovery.movies}
      onDislike={(movie) => handleDislike('discovery', movie)}
      reason={null}
      canInteract={isLoggedIn}
      loading={rows.discovery?.loading ?? false}
      onEndReached={() => loadMore("discovery")}
      isLoadingMore={loadingMore.discovery}
      hasMore={rows.discovery.hasMore}
      link="movie"
    />

    </>
  );
}
