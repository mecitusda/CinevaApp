import api from './axios';

type MediaType = "movie" | "tv";

type LikePayload = {
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  posterPath?: string | null;
  genreIds?: number[];
  voteAverage?: number;
};

export function dislikeMovie(payload: {
  tmdbId: number;
  mediaType: MediaType;
  genreIds: number[];
}) {
  return api.post('/activities/dislike', payload);
}

export async function logView(payload: {
  tmdbId: number;
  genreIds: any[];
  mediaType: string;
  title: string;
  posterPath: string | null
}) {
  await api.post('/activities/view', payload);
}

export async function likeItem(payload: LikePayload) {
  console.log(payload)
  const { data } = await api.post("/activities/like", payload);
  return data;
}

export async function unlikeItem(
  tmdbId: number,
  mediaType: MediaType
) {
  
  const { data } = await api.delete("/activities/like", {
    data: { tmdbId, mediaType },
  });
  return data;
}
