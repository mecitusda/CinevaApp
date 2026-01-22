import { Movie } from '../types/movie';
import api from './axios';

type GetMoviesParams = {
  genre: number;
  page: number;
  excludeIds?: number[];
};


export async function getMovieDetail(id: number) {
  const { data } = await api.get(`/movies/${id}`);
  return data;
}



/* =========================
   UNLIKE (FAVORIDEN ÇIKAR)
========================= */


export async function addFollowing(tmdbId: number,mediaType: "movie" | "tv",title: string, posterPath: string | null) {
  const { data } = await api.post(`/movies/${tmdbId}/following`, { tmdbId,mediaType,title,posterPath });
  return data;
}

export async function removeFollowing(tmdbId: number,mediaType: "movie" | "tv") {
  const { data } = await api.delete(`/movies/${tmdbId}/following`, { data: { tmdbId,mediaType } });
  return data;
}



export async function searchMovies(
  q: string,
  options?: {
    page?: number;
    type?: string;
    signal?: AbortSignal;
  }
) {
  const { data } = await api.get("/movies/search", {
    params: {
      q,
      page: options?.page ?? 1,
      type: options?.type ?? "all",
    },
    signal: options?.signal, // 🔥 SİNYAL GERİ GELDİ
  });

  return data;
}

export async function getMovieTrailer(tmdbId: number) {
  const { data } = await api.get(`/movies/${tmdbId}/trailer`);
  return data.trailer; // null olabilir
}

export async function getMoreMovies(params: {
  type: "trending" | "discovery" | "recommended";
  excludeIds: number[];
  limit?: number;
}) {
  const res = await api.post("/movies/more", params);
  return res.data.movies;
}

export async function getSimilarMovies(params: {
  movieId: number;
  page?: number;
  excludeIds?: number[];
  limit?: number;
}) {
  const { movieId, page = 1, excludeIds = [], limit = 20 } = params;

  const { data } = await api.get(`/movies/${movieId}/similar`, {
    params: {
      page,
      limit,
      excludeIds: excludeIds.join(","),
    },
  });

  return data;
}

export async function getPersonDetail(personId: number) {
  const { data } = await api.get(`/movies/person/${personId}`);
  return data;
}

export async function getMovies({
  genre,
  page,
  excludeIds = [],
}: GetMoviesParams) {
  const { data } = await api.get("/movies/genres", {
    params: {
      genre,
      page,
      excludeIds: excludeIds.join(","),
    },
  });

  return data as {
    movies: Movie[];
    page: number;
    hasMore: boolean;
    genre: number
  };
}

export async function getSeries({
  genre,
  page,
  excludeIds = [],
}: GetMoviesParams) {
  const { data } = await api.get("/series", {
    params: {
      genre,
      page,
      excludeIds: excludeIds.join(","),
    },
  });

  return data as {
    series: Movie[];
    page: number;
    hasMore: boolean;
    genre: number
  };
}

export async function getSimilarSeries({
  seriesId,
  page = 1,
  limit = 20,
}: {
  seriesId: number;
  page?: number;
  limit?: number;
}) {
  const { data } = await api.get(`/series/${seriesId}/similar`, {
    params: { page, limit },
  });

  return data;
}

export async function getSeriesDetail(id: number) {
  const { data } = await api.get(`/series/detail/${id}`);
  return data;
}

export async function getSeriesTrailer(id: number) {
  const { data } = await api.get(`/series/${id}/trailer`);
  console.log(data)
  return data
  }
